require('dotenv').config();

const config = {
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES, 10) || 3,
  INITIAL_DELAY: parseInt(process.env.INITIAL_DELAY, 10) || 500,
  P_LIMIT_CONCURRENCY: parseInt(process.env.P_LIMIT_CONCURRENCY, 10) || 10,
};

module.exports = config;
