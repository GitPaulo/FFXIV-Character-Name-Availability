// Jest setup file for common test configuration
/* global jest, afterEach */
const nock = require('nock');

// Clean up nock after each test
afterEach(() => {
  nock.cleanAll();
});

// Set longer timeout for integration tests
jest.setTimeout(10000);

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
