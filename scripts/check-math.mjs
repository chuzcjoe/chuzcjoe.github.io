import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { mathReference } from '../tests/helpers/math.mjs';

const fixture = JSON.parse(await fs.readFile('tests/fixtures/math-reference.json', 'utf8'));
let expressions = 0, legacy = 0;
for (const [url, reference] of Object.entries(fixture.pages)) {
  const $ = load(await fs.readFile(path.join('dist', decodeURIComponent(url), 'index.html'), 'utf8'));
  const actual = mathReference($('article .content').html());
  assert.deepEqual(actual, reference, `Math content or layout differs from the original site: ${url}`);
  assert.match($('script[src*="MathJax.js"]').attr('src'), /vendor\/mathjax\/unpacked\/MathJax\.js\?config=TeX-MML-AM_CHTML/);
  expressions += reference.tex.length; legacy += reference.katex.length;
}
console.log(`PASS: ${Object.keys(fixture.pages).length} articles match the original site's ${expressions} delimited math segments, their HTML containers, and ${legacy} legacy KaTeX expressions.`);
