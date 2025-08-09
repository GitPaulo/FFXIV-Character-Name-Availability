# Web Scraping Notes

Lodestone is entirely static, here's a few selectors to get the data we need.

## World & Datacenter Selectors

<https://eu.finalfantasyxiv.com/lodestone/worldstatus/>

**Current Structure (2025):**
The page uses data-region attributes:

```js
// Regions are organized by data-region attributes:
EU: div[data-region="3"]
OC: div[data-region="4"] 
NA: div[data-region="2"]
JP: div[data-region="1"]

// Data centers within each region:
.world-dcgroup__item .world-dcgroup__header

// Worlds within each data center:
.world-dcgroup__item ul > li .world-list__world_name > p
```

## Character Search Selectors

<https://na.finalfantasyxiv.com/lodestone/character/?q=Artin+Artemis&worldname=_dc_Primal>

**Current Structure (2025):**

```js
// Character entries container
entries: "a.entry__link"

// Character name within each entry
name: "div.entry__box.entry__box--world > p.entry__name"

// Character world - requires .trim() before .split(" ")[0] due to whitespace
world: "p.entry__world" 
// Example text: "\n                    Cerberus [Chaos]\n                "
// Parsing: .text().trim().split(" ")[0].trim() → "Cerberus"
```

**Critical parsing note:** The world text contains significant whitespace/newlines that must be trimmed before splitting.
