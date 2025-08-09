module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/*.test.js'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/tests/.*\\.e2e\\.test\\.js$' // Exclude E2E tests from default runs
  ],
  collectCoverageFrom: [
    'lib/**/*.js',
    'index.js',
    '!lib/logger.js', // Exclude logger from coverage as it's mostly configuration
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
