const cheerio = require('cheerio');
const characterSearchWithResults = require('./tests/fixtures/characterSearchWithResults');

// Load the fixture HTML
const $ = cheerio.load(characterSearchWithResults);

console.log('=== DEBUG: Parsing characterSearchWithResults fixture ===');

const entries = $("a.entry__link");
console.log(`Found ${entries.length} entries`);

entries.each((i, element) => {
  const characterName = $(element)
    .find("div.entry__box.entry__box--world > p.entry__name")
    .text()
    .trim();
  // Fixed parsing: trim first, then split
  const characterWorld = $(element)
    .find("p.entry__world")
    .text()
    .trim()
    .split(" ")[0]
    .trim();

  console.log(`Entry ${i}:`);
  console.log(`  Character name: "${characterName}"`);
  console.log(`  Character world: "${characterWorld}"`);
  console.log(`  Full world text: "${$(element).find("p.entry__world").text()}"`);

  // Check exact match
  const fullNameQuery = 'John Fantasy';
  const world = 'Cerberus';

  const nameMatch = characterName.toLowerCase() === fullNameQuery.toLowerCase();
  const worldMatch = characterWorld.toLowerCase() === world.toLowerCase();

  console.log(`  Name match: ${nameMatch} (${characterName.toLowerCase()} === ${fullNameQuery.toLowerCase()})`);
  console.log(`  World match: ${worldMatch} (${characterWorld.toLowerCase()} === ${world.toLowerCase()})`);
  console.log('---');
});
