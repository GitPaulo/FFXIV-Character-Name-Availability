require('dotenv').config();

const DEFAULT_MAX_RETRIES = 3;                       // maximum number of retries for failed requests
const DEFAULT_INITIAL_DELAY = 500;                   // initial delay in milliseconds (reduced for faster response)
const DEFAULT_P_LIMIT_CONCURRENCY = 8;               // maximum number of concurrent requests (increased for speed)
const DEFAULT_BACKOFF_CAP = 15000;                   // maximum backoff delay in milliseconds (reduced)
const DEFAULT_AVAILABILITY_CACHE_TTL = 1800;         // availability cache TTL in seconds (30 min, reduced from 1 hour)
const DEFAULT_AVAILABILITY_CACHE_CHECK_PERIOD = 300; // availability cache check period in seconds (5 min)
const DEFAULT_REGION_CACHE_TTL = 21600;              // region cache TTL in seconds (6 hours, kept same)
const DEFAULT_REGION_CACHE_CHECK_PERIOD = 600;      // region cache check period in seconds (10 min, reduced)

const config = {
  MAX_RETRIES: parseInt(process.env.FCA_SCRAPE_MAX_RETRIES, 10) || DEFAULT_MAX_RETRIES,
  INITIAL_DELAY: parseInt(process.env.FCA_SCRAPE_INITIAL_DELAY_MS, 10) || DEFAULT_INITIAL_DELAY,
  P_LIMIT_CONCURRENCY: parseInt(process.env.FCA_P_LIMIT_CONCURRENCY, 10) || DEFAULT_P_LIMIT_CONCURRENCY,
  BACKOFF_CAP: parseInt(process.env.FCA_SCRAPE_BACKOFF_CAP_MS, 10) || DEFAULT_BACKOFF_CAP,
  CACHES: {
    AVAILABILITY: {
      TTL: parseInt(process.env.FCA_AVAILABILITY_CACHE_TTL_SEC, 10) || DEFAULT_AVAILABILITY_CACHE_TTL,
      CHECK_PERIOD: parseInt(process.env.FCA_AVAILABILITY_CACHE_CHECK_PERIOD_SEC, 10) || DEFAULT_AVAILABILITY_CACHE_CHECK_PERIOD,
    },
    REGION: {
      TTL: parseInt(process.env.FCA_REGION_CACHE_TTL_SEC, 10) || DEFAULT_REGION_CACHE_TTL,
      CHECK_PERIOD: parseInt(process.env.FCA_REGION_CACHE_CHECK_PERIOD_SEC, 10) || DEFAULT_REGION_CACHE_CHECK_PERIOD,
    },
  },
};

module.exports = config;
