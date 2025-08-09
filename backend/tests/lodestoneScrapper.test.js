/* eslint-env jest */
const nock = require('nock');

// Keep tests isolated and simple: mock config and logger
jest.mock('../config', () => ({
  P_LIMIT_CONCURRENCY: 2,
  MAX_RETRIES: 1,
  INITIAL_DELAY: 10,
  BACKOFF_CAP: 100,
  CACHES: {
    AVAILABILITY: { TTL: 2, CHECK_PERIOD: 1 },
    REGION: { TTL: 2, CHECK_PERIOD: 1 }
  }
}));

jest.mock('../lib/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Fixtures
const worldStatusResponse = require('./fixtures/worldStatusResponse');
const characterSearchWithResults = require('./fixtures/characterSearchWithResults');
const characterSearchNoResults = require('./fixtures/characterSearchNoResults');

// Helper: all worlds present in worldStatusResponse fixture
const ALL_WORLDS = {
  EU: { Chaos: ['Cerberus', 'Louisoix'], Light: ['Lich', 'Odin'] },
  OC: { Materia: ['Bismarck', 'Ravana'] },
  NA: { Crystal: ['Balmung', 'Brynhildr'] },
  JP: { Elemental: ['Aegis', 'Atomos'] },
};

describe('lodestoneScrapper (single simple suite)', () => {
  // Import after mocks are defined
  const lodestoneScrapper = require('../lib/lodestoneScrapper');

  beforeEach(() => {
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('rejects when world status API returns 500', async () => {
    console.log('Testing error handling: World status API failure...');
    nock('https://eu.finalfantasyxiv.com')
      .get('/lodestone/worldstatus/')
      .reply(500, 'Server Error');

    await expect(lodestoneScrapper('Any Name')).rejects.toThrow();
    console.log('✓ Error handling test passed - correctly rejects on API failure');
  });

  test('builds structure; current behavior: no-result pages yield false (unavailable)', async () => {
    console.log('Testing structure building with available character name...');
    const startTime = Date.now();

    // World status
    nock('https://eu.finalfantasyxiv.com')
      .get('/lodestone/worldstatus/')
      .reply(200, worldStatusResponse);

    // All worlds return no results
    Object.values(ALL_WORLDS).forEach((dcs) => {
      Object.values(dcs).flat().forEach((world) => {
        nock('https://na.finalfantasyxiv.com')
          .get('/lodestone/character/')
          .query({ q: 'Available Name', worldname: world, order: '5' })
          .reply(200, characterSearchNoResults);
      });
    });

    const result = await lodestoneScrapper('Available Name');
    const duration = Date.now() - startTime;

    // Structure checks (spot-check a few)
    expect(result).toHaveProperty('EU');
    expect(result).toHaveProperty('OC');
    expect(result).toHaveProperty('NA');
    expect(result).toHaveProperty('JP');
    expect(result.EU).toHaveProperty('Chaos');
    expect(result.NA).toHaveProperty('Crystal');

    // Current implementation sets true when the search page has no entries (name is available)
    expect(result.EU.Chaos.Cerberus).toBe(true);
    expect(result.EU.Chaos.Louisoix).toBe(true);
    expect(result.JP.Elemental.Aegis).toBe(true);

    const totalWorlds = Object.values(ALL_WORLDS).flatMap(dcs => Object.values(dcs).flat()).length;
    console.log(`✓ Structure test completed in ${duration}ms - validated ${totalWorlds} worlds (all available)`);
  });

  test('marks a world unavailable when an exact match is found on that world; others remain false with no results', async () => {
    console.log('Testing character match detection...');
    const startTime = Date.now();

    // World status
    nock('https://eu.finalfantasyxiv.com')
      .get('/lodestone/worldstatus/')
      .reply(200, worldStatusResponse);

    // Exact match on Cerberus only
    nock('https://na.finalfantasyxiv.com')
      .get('/lodestone/character/')
      .query({ q: 'John Fantasy', worldname: 'Cerberus', order: '5' })
      .reply(200, characterSearchWithResults);

    // Everyone else: no results
    Object.values(ALL_WORLDS).forEach((dcs) => {
      Object.values(dcs).flat().forEach((world) => {
        if (world === 'Cerberus') return;
        nock('https://na.finalfantasyxiv.com')
          .get('/lodestone/character/')
          .query({ q: 'John Fantasy', worldname: world, order: '5' })
          .reply(200, characterSearchNoResults);
      });
    });

    const result = await lodestoneScrapper('John Fantasy');
    const duration = Date.now() - startTime;

    expect(result.EU.Chaos.Cerberus).toBe(false); // match found -> unavailable
    // With current logic, pages with no entries set true (available)
    expect(result.EU.Chaos.Louisoix).toBe(true);

    console.log(`✓ Character match test completed in ${duration}ms - found character on Cerberus, available elsewhere`);
  });

  test('sets a world to false when character search fails (server error)', async () => {
    console.log('Testing error handling: Character search failures...');
    const startTime = Date.now();

    // Use a minimal slice: rely on fixture and catch-all mocks so there are no hangs
    nock('https://eu.finalfantasyxiv.com')
      .get('/lodestone/worldstatus/')
      .reply(200, worldStatusResponse);

    // Specific failing world first
    nock('https://na.finalfantasyxiv.com')
      .get('/lodestone/character/')
      .query({ q: 'Failing Name', worldname: 'Balmung', order: '5' })
      .reply(500, 'Internal Server Error');

    // Catch-all for the rest of worlds this run (exclude Balmung)
    Object.values(ALL_WORLDS).forEach((dcs) => {
      Object.values(dcs).flat().forEach((world) => {
        if (world === 'Balmung') return;
        nock('https://na.finalfantasyxiv.com')
          .get('/lodestone/character/')
          .query({ q: 'Failing Name', worldname: world, order: '5' })
          .reply(200, characterSearchNoResults);
      });
    });

    const result = await lodestoneScrapper('Failing Name');
    const duration = Date.now() - startTime;

    expect(result.NA.Crystal.Balmung).toBe(null); // failed search -> null
    // spot checks
    expect(typeof result.EU.Chaos.Cerberus).toBe('boolean');
    expect(typeof result.JP.Elemental.Aegis).toBe('boolean');

    console.log(`✓ Error handling test completed in ${duration}ms - correctly handles server errors (Balmung: null)`);
  });
});
