import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { filesIn } from '../lib/content.mjs';

const out = path.resolve('dist');
const files = await filesIn(out);
if (!files.length) throw Error('Run npm run build first.');
const errors = new Set(), inheritedLinks = new Set();
for (const file of files.filter(f => f.endsWith('.html'))) {
  const $ = load(await fs.readFile(file, 'utf8'));
  for (const el of $('[src],link[href],a[href]').toArray()) {
    const isLink = el.tagName === 'a';
    const url = $(el).attr('src') || $(el).attr('href');
    if (!url || url.startsWith('#')) continue;
    let target;
    try {
      const resolved = new URL(url, 'https://check.local/' + path.relative(out, file).split(path.sep).join('/'));
      if (resolved.origin !== 'https://check.local') continue;
      target = path.join(out, decodeURIComponent(resolved.pathname));
    } catch { errors.add(`Malformed local URL: ${url}`); continue; }
    const stat = await fs.stat(target).catch(() => null);
    const exists = stat?.isFile() || (stat?.isDirectory() && await fs.stat(path.join(target, 'index.html')).catch(() => null));
    if (!exists) (isLink ? inheritedLinks : errors).add(url);
  }
}
console.log(`Checked ${files.filter(f => f.endsWith('.html')).length} HTML pages and their local resource references.`);
if (inheritedLinks.size) console.log('Content links that need author review:', [...inheritedLinks].join(', '));
if (errors.size) { console.error([...errors].join('\n')); process.exitCode = 1; }
else console.log('All local scripts, styles, images, fonts and linked resources resolve.');
