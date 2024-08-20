const axios = require("axios");
const cheerio = require("cheerio");
const pLimit = require("p-limit");
const NodeCache = require("node-cache");

// Logger
const logger = require('../logger');

// Constants and configuration
const config = require("../config");
const limit = pLimit(config.P_LIMIT_CONCURRENCY);
const MAX_RETRIES = config.MAX_RETRIES;
const INITIAL_DELAY = config.INITIAL_DELAY;
const BACKOFF_CAP = 16000; // 16 seconds

// Initialize NodeCache
const availabilityCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
const regionCache = new NodeCache({ stdTTL: 21600, checkperiod: 1200 });

async function fetchRegionDatacenterWorldTable() {
  const cacheKey = "regionData";
  const cachedData = regionCache.get(cacheKey);

  if (cachedData) {
    logger.debug("Returning cached region data");
    return cachedData;
  }

  const url = "https://eu.finalfantasyxiv.com/lodestone/worldstatus/";
  logger.debug(`Fetching world status from: ${url}`);
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // REF: Selectors.md
    const regions = [
      { name: "EU", selector: "div:nth-child(7)" },
      { name: "OC", selector: "div:nth-child(8)" },
      { name: "NA", selector: "div:nth-child(9)" },
      { name: "JP", selector: "div:nth-child(10)" },
    ];
    const regionsData = regions.reduce((acc, region) => {
      logger.debug(`Parsing region: ${region.name} with selector: ${region.selector}`);
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

function parseRegionDataCenters($, regionSelector) {
  const dataCenters = {};

  logger.debug(`Selecting data centers with selector: ${regionSelector} > div > ul > li`);
  $(`${regionSelector} > div > ul > li`).each((i, element) => {
    const dcName = $(element).find("h2").text().trim(); // Extract the data center name
    logger.debug(`Found data center: ${dcName}`);

    const worlds = [];
    logger.debug(`Selecting worlds for data center: ${dcName} with selector: ul > li`);
    $(element)
      .find("ul > li")
      .each((j, worldElement) => {
        const worldName = $(worldElement)
          .find("div.world-list__world_name > p")
          .text()
          .trim(); // Extract the world name
        logger.debug(`Found world: ${worldName} in data center: ${dcName}`);
        worlds.push(worldName);
      });

    dataCenters[dcName] = worlds;
  });

  return dataCenters;
}

async function scrapeCharacter(
  fullNameQuery,
  world,
  resultContainer,
  retries = MAX_RETRIES,
  delay = INITIAL_DELAY
) {
  const cacheKey = `${fullNameQuery.toLowerCase()}-${world.toLowerCase()}`;
  const cachedResult = availabilityCache.get(cacheKey);

  if (cachedResult !== undefined) {
    logger.debug(`Cache hit for world: ${world}`);
    resultContainer[world] = !cachedResult;
    return;
  }

  try {
    const url = `https://na.finalfantasyxiv.com/lodestone/character/?q=${encodeURIComponent(
      fullNameQuery
    )}&worldname=${encodeURIComponent(world)}`;
    logger.debug(`Fetching character data from: ${url}`);

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const matchFound = checkForMatch($, fullNameQuery, world);

    availabilityCache.set(cacheKey, matchFound);
    resultContainer[world] = !matchFound;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers["retry-after"]
        ? parseInt(error.response.headers["retry-after"], 10) * 1000
        : delay;
      logger.warn(
        `Received 429 Too Many Requests. Retrying after ${retryAfter / 1000} seconds...`
      );
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        return scrapeCharacter(
          fullNameQuery,
          world,
          resultContainer,
          retries - 1,
          Math.min(delay * 2, BACKOFF_CAP)
        );
      } else {
        logger.error(`Exceeded retry limit for world ${world}`);
      }
    } else {
      logger.error(`Error occurred while searching in world ${world}`, error);
    }
    availabilityCache.set(cacheKey, false);
    resultContainer[world] = true;
  }
}

function checkForMatch($, fullNameQuery, world) {
  let matchFound = false;
  $("a.entry__link").each((i, element) => {
    const characterName = $(element)
      .find("div.entry__box.entry__box--world > p.entry__name")
      .text()
      .trim();
    const characterWorld = $(element)
      .find("p.entry__world")
      .text()
      .split(" ")[0]
      .trim();

    if (
      characterName === fullNameQuery &&
      characterWorld.toLowerCase() === world.toLowerCase()
    ) {
      matchFound = true;
      logger.debug(
        `Match found for character: ${characterName} in world: ${characterWorld}`
      );
    }
  });
  return matchFound;
}

/**
 * Find character name availability across all regions, data centers, and worlds
 * @param {string} fullNameQuery 
 * @returns Promise<Record<string, Record<string, Record<string, boolean>>>>
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
