require('dotenv').config();

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_INITIAL_DELAY = 500;
const DEFAULT_P_LIMIT_CONCURRENCY = 16;

const config = {
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES, 10) || DEFAULT_MAX_RETRIES,
  INITIAL_DELAY: parseInt(process.env.INITIAL_DELAY, 10) || DEFAULT_INITIAL_DELAY,
  P_LIMIT_CONCURRENCY: parseInt(process.env.P_LIMIT_CONCURRENCY, 10) || DEFAULT_P_LIMIT_CONCURRENCY,
};

module.exports = config;
