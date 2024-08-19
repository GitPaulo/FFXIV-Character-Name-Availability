const axios = require("axios");
const cheerio = require("cheerio");
const pLimit = require("p-limit");
const NodeCache = require("node-cache");

// Set the maximum number of concurrent requests
const limit = pLimit(15);
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000;

// Initialize NodeCache with a TTL of 1 hour (3600 seconds)
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

async function fetchRegionDatacenterWorldTable() {
  const url = "https://eu.finalfantasyxiv.com/lodestone/worldstatus/";
  console.debug(`Fetching world status from: ${url}`);
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const regions = [
      { name: "EU", selector: "div:nth-child(7)" },
      { name: "OC", selector: "div:nth-child(8)" },
      { name: "NA", selector: "div:nth-child(9)" },
      { name: "JP", selector: "div:nth-child(10)" },
    ];

    const regionsData = regions.reduce((acc, region) => {
      acc[region.name] = parseRegionDataCenters($, region.selector);
      return acc;
    }, {});

    return regionsData;
  } catch (error) {
    logError("Error fetching world status", error);
    throw error;
  }
}

function parseRegionDataCenters($, regionSelector) {
  const dataCenters = {};

  $(`${regionSelector} > ul > li`).each((i, element) => {
    const dcName = $(element).find("h2").text().trim(); // Extract the data center name
    const worlds = [];

    $(element)
      .find("ul > li")
      .each((j, worldElement) => {
        const worldName = $(worldElement)
          .find("div.world-list__world_name > p")
          .text()
          .trim(); // Extract the world name
        worlds.push(worldName);
      });

    dataCenters[dcName] = worlds;
  });

  return dataCenters;
}

async function findCharacterNameAvailability(fullNameQuery) {
  try {
    const regions = await fetchRegionDatacenterWorldTable();
    const results = {};
    const tasks = [];

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
    logError("Error occurred during character search", error);
    throw error;
  }
}

async function scrapeCharacter(
  fullNameQuery,
  world,
  resultContainer,
  retries = MAX_RETRIES,
  delay = INITIAL_DELAY
) {
  // Check cache first
  const cacheKey = `${fullNameQuery.toLowerCase()}-${world.toLowerCase()}`;
  const cachedResult = cache.get(cacheKey);

  if (cachedResult !== undefined) {
    console.debug(`Cache hit for world: ${world}`);
    resultContainer[world] = false; // Means in that world is not available
    return;
  }

  // Fetch character data from Lodestone search
  try {
    const url = `https://na.finalfantasyxiv.com/lodestone/character/?q=${encodeURIComponent(
      fullNameQuery
    )}&worldname=${encodeURIComponent(world)}`;
    console.debug(`Fetching character data from: ${url}`);

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const matchFound = checkForMatch($, fullNameQuery, world);

    cache.set(cacheKey, matchFound);      // Cache the result
    resultContainer[world] = !matchFound; // Invert the result to indicate availability
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Retry after the specified time if rate limited (429 Too Many Requests) or use exponential backoff
      const retryAfter = error.response.headers["retry-after"]
        ? parseInt(error.response.headers["retry-after"], 10) * 1000
        : delay;
      console.warn(
        `Received 429 Too Many Requests. Retrying after ${retryAfter / 1000
        } seconds...`
      );
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, retryAfter));
        return scrapeCharacter(
          fullNameQuery,
          world,
          resultContainer,
          retries - 1,
          Math.min(delay * 2, 16000) // Exponential backoff with a cap of 16 seconds
        ); // Capping delay to prevent excessive backoff
      } else {
        console.error(`Exceeded retry limit for world ${world}`);
      }
    } else {
      logError(`Error occurred while searching in world ${world}`, error);
    }
    cache.set(cacheKey, false); // Cache the result as false if an error occurs
    resultContainer[world] = true;
  }
}

function checkForMatch($, fullNameQuery, world) {
  let matchFound = false;
  $("a.entry__link").each((i, element) => {
    const characterName = $(element)
      .find("div.entry__box.entry__box--world > p.entry__name")
      .text()
      .trim(); // Extract the character name
    const characterWorld = $(element)
      .find("p.entry__world")
      .text()
      .split(" ")[0]
      .trim(); // Extract the character's world

    if (
      characterName === fullNameQuery &&
      characterWorld.toLowerCase() === world.toLowerCase()
    ) {
      matchFound = true;
      console.debug(
        `Match found for character: ${characterName} in world: ${characterWorld}`
      );
    }
  });
  return matchFound;
}

// Logging helper function
function logError(message, error) {
  console.error(`${message}:`, error.message);
}

exports.findCharacterNameAvailability = findCharacterNameAvailability;
