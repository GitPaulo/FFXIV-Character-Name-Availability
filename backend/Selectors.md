# Web Scraping Notes

Lodestone is entirely static, here's a few selectors to get the data we need.

## World & Datacenter Selectors

https://eu.finalfantasyxiv.com/lodestone/worldstatus/


```js
EU 1st dc: body > div.ldst__bg > div.ldst__contents--worldstatus.clearfix > div:nth-child(7) > div > ul > li:nth-child(1) > h2
EU 1st world on that dc: body > div.ldst__bg > div.ldst__contents--worldstatus.clearfix > div:nth-child(7) > div > ul > li:nth-child(1) > ul > li:nth-child(1) > div > div.world-list__world_name > p

OC 1st dc: body > div.ldst__bg > div.ldst__contents--worldstatus.clearfix > div:nth-child(8) > div > ul > li > h2
OC 1st world on that dc: body > div.ldst__bg > div.ldst__contents--worldstatus.clearfix > div:nth-child(8) > div > ul > li > ul > li:nth-child(1) > div > div.world-list__world_name > p

NA 1st dc: body > div.ldst__bg > div.ldst__contents--worldstatus.clearfix > div:nth-child(9) > div > ul > li:nth-child(1) > h2
NA 1st world on that dc: body > div.ldst__bg > div.ldst__contents--worldstatus.clearfix > div:nth-child(9) > div > ul > li:nth-child(1) > ul > li:nth-child(1) > div > div.world-list__world_name > p

JP 1st dc: body > div.ldst__bg > div.ldst__contents--worldstatus.clearfix > div:nth-child(10) > div > ul > li:nth-child(1) > h2
JP 1st world of that dc: body > div.ldst__bg > div.ldst__contents--worldstatus.clearfix > div:nth-child(10) > div > ul > li:nth-child(1) > ul > li:nth-child(1) > div > div.world-list__world_name > p
```

## Character Selectors

https://na.finalfantasyxiv.com/lodestone/character/?q=Artin+Artemis&worldname=_dc_Primal


```js
Character Name: #community > div.ldst__bg > div.ldst__contents.clearfix > div.ldst__main > div > div:nth-child(8) > a.entry__link > div.entry__box.entry__box--world > p.entry__name
```
