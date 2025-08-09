const axios = require("axios");
const cheerio = require("cheerio");
const pLimit = require("p-limit");
const NodeCache = require("node-cache");

const logger = require('./logger');
const config = require("../config");

const limit = pLimit(config.P_LIMIT_CONCURRENCY);
const MAX_RETRIES = config.MAX_RETRIES;
const INITIAL_DELAY = config.INITIAL_DELAY;
const BACKOFF_CAP = config.BACKOFF_CAP;

const availabilityCache = new NodeCache({
  stdTTL: config.CACHES.AVAILABILITY.TTL,
  checkperiod: config.CACHES.AVAILABILITY.CHECK_PERIOD
});
const regionCache = new NodeCache({
  stdTTL: config.CACHES.REGION.TTL,
  checkperiod: config.CACHES.REGION.CHECK_PERIOD
});

/**
 * Fetches and parses the FFXIV world status page
 * @returns {Promise<Object>} A promise that resolves to an object containing region, data center, and world information
 */
async function fetchRegionDatacenterWorldTable() {
  const cacheKey = "regionData";
  const cachedData = regionCache.get(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  const url = "https://eu.finalfantasyxiv.com/lodestone/worldstatus/";
  logger.debug(`Fetching world status: ${url}`);

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const regions = [
      { name: "EU", selector: 'div[data-region="3"]' },
      { name: "OC", selector: 'div[data-region="4"]' },
      { name: "NA", selector: 'div[data-region="2"]' },
      { name: "JP", selector: 'div[data-region="1"]' },
    ];

    const regionsData = regions.reduce((acc, region) => {
      logger.debug(`Parsing region: ${region.name}`);
      acc[region.name] = parseRegionDataCenters($, region.selector);
      return acc;
    }, {});

    regionCache.set(cacheKey, regionsData);
    return regionsData;
  } catch (error) {
    logger.error("Error fetching world status", error);
    throw error;
  }
}

/**
 * Parses datacenter and world information from a region's HTML section
 * @param {Object} $ - Cheerio instance for parsing HTML
 * @param {string} regionSelector - The CSS selector for the region's section
 * @returns {Object} An object containing data center names as keys and arrays of world names as values
 */
function parseRegionDataCenters($, regionSelector) {
  const dataCenters = {};

  $(`${regionSelector} .world-dcgroup__item`).each((i, element) => {
    const worlds = [];
    const dcName = $(element).find(".world-dcgroup__header").text().trim();

    $(element)
      .find("ul > li")
      .each((j, worldElement) => {
        const worldName = $(worldElement)
          .find("div.world-list__world_name > p")
          .text()
          .trim();
        worlds.push(worldName);
      });

    dataCenters[dcName] = worlds;
  });

  return dataCenters;
}

/**
 * Scrapes character availability for a specific world with robust error handling
 * @param {string} fullNameQuery - The full name to search for
 * @param {string} world - The world to search in
 * @param {Object} resultContainer - The container to store the results
 * @param {number} retries - The number of retries left
 * @param {number} delay - The delay before the next retry
 * @returns {Promise<void>} A promise that resolves when the scraping is complete
 */
async function scrapeCharacter(
  fullNameQuery,
  world,
  resultContainer,
  retries = MAX_RETRIES,
  delay = INITIAL_DELAY
) {
  const nameLower = fullNameQuery.toLowerCase();
  const worldLower = world.toLowerCase();
  const cacheKey = `${nameLower}-${worldLower}`;
  const cached = availabilityCache.get(cacheKey);
  if (cached !== undefined) {
    resultContainer[world] = cached;
    return;
  }

  let attempt = 0;
  let currentDelay = delay;

  while (attempt <= retries) {
    try {
      const encodedName = encodeURIComponent(fullNameQuery);
      const encodedWorld = encodeURIComponent(world);
      const url = `https://na.finalfantasyxiv.com/lodestone/character/?q=${encodedName}&worldname=${encodedWorld}&order=5`;

      logger.debug(`Fetching character data: ${url}`);
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const entries = $("a.entry__link");
      if (!entries.length) {
        availabilityCache.set(cacheKey, true); // available
        resultContainer[world] = true;
        return;
      }

      const isTaken = checkForMatch($, fullNameQuery, world);
      const isAvailable = !isTaken;

      if (!isAvailable) {
        logger.info(`Character "${fullNameQuery}" found on ${world}`);
      }

      availabilityCache.set(cacheKey, isAvailable);
      resultContainer[world] = isAvailable;
      return;

    } catch (error) {
      const status = error.response?.status;
      logger.debug(`Error for ${world}:`, {
        status,
        code: error.code,
        message: error.message
      });

      let retryFactor = 1.5; // default retry speed
      let jitter = false;

      if (status === 429) {
        logger.warn(`Rate limited for world ${world}`);
        retryFactor = 2;
        jitter = true;
      } else if (status >= 500) {
        logger.warn(`Server error ${status} for world ${world}`);
      } else if (["ECONNRESET", "ETIMEDOUT"].includes(error.code)) {
        logger.warn(`Network error for world ${world}`);
      } else {
        logger.error(`Unhandled error for world ${world}:`, error);
        break;
      }

      attempt++;
      if (attempt > retries) {
        logger.error(`Retry attempts exhausted for world ${world}`);
        break;
      }

      const jitterMs = jitter ? Math.random() * 1000 : 0;
      currentDelay = Math.min(currentDelay * retryFactor, BACKOFF_CAP) + jitterMs;
      logger.warn(`Retrying ${world} in ${Math.floor(currentDelay / 1000)} seconds...`);
      await new Promise(r => setTimeout(r, currentDelay));
    }
  }

  resultContainer[world] = null; // unconfirmed/error
}

/**
 * Checks if a character name exactly matches any results on the current page
 * @param {Object} $ - Cheerio instance for parsing HTML
 * @param {string} fullNameQuery - The full name to search for
 * @param {string} world - The world to search in
 * @returns {boolean} True if a match is found, false otherwise
 */
function checkForMatch($, fullNameQuery, world) {
  let matchFound = false;
  const entries = $("a.entry__link");

  entries.each((i, element) => {
    const characterName = $(element)
      .find("div.entry__box.entry__box--world > p.entry__name")
      .text()
      .trim();
    const characterWorld = $(element)
      .find("p.entry__world")
      .text()
      .trim()
      .split(" ")[0]
      .trim();

    if (
      characterName.toLowerCase() === fullNameQuery.toLowerCase() &&
      characterWorld.toLowerCase() === world.toLowerCase()
    ) {
      matchFound = true;
      logger.debug(`Match found: ${characterName} in ${characterWorld}`);
      return false; // break loop
    }
  });

  return matchFound;
}

/**
 * Find character name availability across all FFXIV regions, data centers, and worlds
 * @param {string} fullNameQuery - The full name to search for
 * @returns {Promise<Object>} A promise that resolves to an object containing availability information
 */
module.exports = async (fullNameQuery) => {
  try {
    const regions = await fetchRegionDatacenterWorldTable();
    const results = {};
    const tasks = [];
    logger.debug("Regions:", regions);

    for (const [regionName, dataCenters] of Object.entries(regions)) {
      results[regionName] = {};

      for (const [dataCenter, worlds] of Object.entries(dataCenters)) {
        results[regionName][dataCenter] = {};

        worlds.forEach((world) => {
          tasks.push(
            limit(() =>
              scrapeCharacter(
                fullNameQuery,
                world,
                results[regionName][dataCenter]
              )
            )
          );
        });
      }
    }

    await Promise.all(tasks);
    return results;
  } catch (error) {
    logger.error("Error occurred during character search", error);
    throw error;
  }
}
