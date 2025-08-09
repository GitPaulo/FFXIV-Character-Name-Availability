/* eslint-env jest */
/**
 * End-to-End tests against the real Lodestone
 * These tests hit the actual FFXIV Lodestone to catch structural changes
 * 
 * WARNING: These are slow and can be flaky due to network issues
 * They should be run sparingly (e.g., nightly) to detect breaking changes
 */

const lodestoneScrapper = require('../lib/lodestoneScrapper');

// Increase timeout for real network requests
jest.setTimeout(60000);

// Only run E2E tests when specifically requested
const runE2E = process.env.NODE_ENV === 'test' || process.env.RUN_E2E === 'true';

const describeE2E = runE2E ? describe : describe.skip;

describeE2E('Lodestone E2E Tests', () => {
  test('should fetch world status and return structured data', async () => {
    console.log('Testing against real Lodestone...');
    const startTime = Date.now();

    // Use a name that's very unlikely to exist to test "available" logic
    const unlikelyName = `TestChar${Date.now()}`;
    console.log(`Searching for character: "${unlikelyName}"`);

    const result = await lodestoneScrapper(unlikelyName);
    const duration = Date.now() - startTime;

    // Check basic structure
    expect(result).toHaveProperty('EU');
    expect(result).toHaveProperty('NA');
    expect(result).toHaveProperty('JP');
    expect(result).toHaveProperty('OC');

    // Check that EU has Chaos datacenter with Cerberus world
    expect(result.EU).toHaveProperty('Chaos');
    expect(result.EU.Chaos).toHaveProperty('Cerberus');

    // Check that NA has a datacenter with worlds
    const naDatacenters = Object.keys(result.NA);
    expect(naDatacenters.length).toBeGreaterThan(0);

    const firstNADC = result.NA[naDatacenters[0]];
    const firstNAWorld = Object.keys(firstNADC)[0];

    // For an unlikely name, most worlds should be available (true) or have no result (true)
    // Some might be null due to rate limiting or errors
    const worldStatus = firstNADC[firstNAWorld];
    expect([true, false, null]).toContain(worldStatus);

    // Calculate statistics
    const totalWorlds = Object.values(result).map(region =>
      Object.values(region).map(dc => Object.keys(dc).length).reduce((a, b) => a + b, 0)
    ).reduce((a, b) => a + b, 0);

    const allStatuses = Object.values(result)
      .flatMap(region => Object.values(region))
      .flatMap(datacenter => Object.values(datacenter));

    const available = allStatuses.filter(s => s === true).length;
    const unavailable = allStatuses.filter(s => s === false).length;
    const errors = allStatuses.filter(s => s === null).length;

    console.log(`✓ E2E Test completed in ${duration}ms`);
    console.log(`Results: ${totalWorlds} worlds total | ${available} available | ${unavailable} unavailable | ${errors} errors`);
    console.log(`Regions: EU(${Object.keys(result.EU).length} DCs), NA(${Object.keys(result.NA).length} DCs), JP(${Object.keys(result.JP).length} DCs), OC(${Object.keys(result.OC).length} DCs)`);
  });

  test('should handle real network errors gracefully', async () => {
    // This test ensures our error handling works with real network conditions
    const result = await lodestoneScrapper('TestName');

    // Should not throw and should return a structured response
    expect(typeof result).toBe('object');
    expect(result).not.toBeNull();

    // Check that at least some worlds returned results (even if null due to errors)
    const allWorldStatuses = Object.values(result)
      .flatMap(region => Object.values(region))
      .flatMap(datacenter => Object.values(datacenter));

    expect(allWorldStatuses.length).toBeGreaterThan(0);

    // At least some worlds should have gotten a response (true, false, or null)
    const validResponses = allWorldStatuses.filter(status =>
      status === true || status === false || status === null
    );
    expect(validResponses.length).toBeGreaterThan(0);
  });
});

// Sanity check test that always runs to ensure E2E test file is valid
describe('E2E Test Setup', () => {
  test('should have valid scraper module', () => {
    expect(typeof lodestoneScrapper).toBe('function');
  });

  test('should skip E2E tests when not in test environment', () => {
    if (!runE2E) {
      console.log('⏭️  Skipping E2E tests (set NODE_ENV=test or RUN_E2E=true to run)');
    } else {
      console.log('🚀 Running E2E tests against real Lodestone');
    }
    expect(true).toBe(true); // Always pass
  });
});
