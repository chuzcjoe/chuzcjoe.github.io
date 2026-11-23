import fs from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';
const origin = process.env.BLOG_URL || 'http://localhost:4321';
const slug = `migration-smoke-${Date.now()}`;
const file = `content/_posts/${slug}.md`;
const url = `/misc/${slug}/`;
async function until(check) { for (let i = 0; i < 100; i++) { if (await check()) return; await setTimeout(200); } throw Error('Timed out waiting for Markdown dev server'); }
try {
  if (!(await fetch(origin)).ok) throw Error('Start npm run dev first.');
  await fs.writeFile(file, `---\ntitle: Migration Smoke Test\ndate: 2026-10-14\ncategories: misc\ntags: [smoke-test]\n---\n\nDirect Markdown publishing works: ${slug}\n`);
  await until(async () => { const r = await fetch(origin + url); return r.ok && (await r.text()).includes(slug); });
  const index = await (await fetch(origin + '/content.json')).json();
  if (!index.posts.some(p => p.link === url)) throw Error('New article missing from search index');
  if (!(await (await fetch(origin + '/atom.xml')).text()).includes(slug)) throw Error('New article missing from feed');
  console.log('PASS: adding one Markdown file updates article, search and Atom feed automatically.');
} finally {
  await fs.rm(file, { force: true });
  await until(async () => (await fetch(origin + url)).status === 404);
  console.log('PASS: deleting that Markdown file removes its route automatically. Temporary test content removed.');
}
