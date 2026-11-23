import test, { before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { load } from 'cheerio';
import { build } from '../lib/build.mjs';
import { loadContent, readConfig, createMarkdown, preprocess } from '../lib/content.mjs';
import { mathReference } from './helpers/math.mjs';

const root = process.cwd();
let result, config;
before(async () => { config = await readConfig(root); result = await build(); });
const html = async url => load(await fs.readFile(path.join(root, 'dist', decodeURIComponent(url.slice(1)), 'index.html'), 'utf8'));

test('all imported posts, categories, tags and unpublished drafts are accounted for', () => {
  assert.equal(result.posts, 284); assert.equal(result.pages, 1); assert.equal(result.categories, 8); assert.equal(result.tags, 225);
  assert.ok(result.site.posts.every(p => !p.relative.includes('_drafts')));
});

test('all 1,043 original HTML paths still exist', async () => {
  const routes = JSON.parse(await fs.readFile('tests/legacy-routes.json', 'utf8'));
  for (const route of routes) await fs.access(path.join(root, 'dist', route));
  assert.equal(routes.length, 1043);
});

test('reference pages retain their titles, layout, ordering and widgets', async () => {
  const refs = JSON.parse(await fs.readFile('tests/reference.json', 'utf8'));
  for (const [url, ref] of Object.entries(refs)) {
    const $ = await html(url);
    assert.equal($('title').text(), ref.title, url);
    assert.equal($('.column-main').attr('class'), ref.mainClass, url);
    assert.deepEqual($('.column-main article.article > .title').map((_, el) => $(el).text()).get(), ref.articleTitles, url);
    assert.deepEqual($('.column-left > .widget').map((_, el) => $(el).attr('data-type')).get(), ref.widgets, url);
  }
});

test('homepage pinning does not reorder recent posts or feeds', async () => {
  const $ = await html('/');
  assert.equal($('.column-main article .title').first().text(), 'Table Tennis Practice');
  assert.equal($('.column-right .media .title').first().text(), '2026 Winchester Mystery House Halloween');
  const feed = load(await fs.readFile('dist/atom.xml', 'utf8'), { xmlMode: true });
  assert.equal(feed('entry').length, 20); assert.equal(feed('entry title').first().text(), '2026 Winchester Mystery House Halloween');
});

test('pagination and archive pages contain the appropriate distinct posts', async () => {
  const first = await html('/'), second = await html('/page/2/');
  const a = first('.column-main article > .title a').map((_, e) => first(e).attr('href')).get();
  const b = second('.column-main article > .title a').map((_, e) => second(e).attr('href')).get();
  assert.equal(a.length, 10); assert.equal(b.length, 10); assert.ok(b.every(url => !a.includes(url)));
  const archive = await html('/archives/2026/10/');
  assert.equal(archive('.timeline .media').length, 3);
  assert.deepEqual(archive('.timeline .title').map((_, el) => archive(el).text()).get(), ['2026 Winchester Mystery House Halloween', 'Pumpkin After Dark', 'Online Softmax']);
});

test('post-specific profiles, directory anchors, math and adjacent post links work', async () => {
  const $ = await html('/misc/misc-online-softmax/');
  assert.equal($('.column-left .avatar').attr('src'), config.widgets.find(w => w.type === 'profile' && w.position === 'left').avatar);
  assert.equal($('.katex').length, 0);
  assert.match($('.content').text(), /\$\$\\begin\{array\}/);
  assert.match($('script[src*="MathJax.js"]').attr('src'), /mathjax\/unpacked\/MathJax\.js\?config=TeX-MML-AM_CHTML/);
  assert.ok($('figure.highlight .code').length); assert.ok($('figure.highlight .gutter').length);
  for (const a of $('#toc a').toArray()) assert.ok($('[id]').toArray().some(e => $(e).attr('id') === $(a).attr('href').slice(1)));
  assert.equal($('.article-nav-next').attr('href'), '/life/life-weekend-snapshots/');
  assert.match($('#disqus_thread').next('script').html(), /misc\/misc-online-softmax\//);
});

test('legacy KaTeX tags render without errors; ordinary math is left to MathJax', () => {
  for (const post of result.site.posts) {
    const $ = load(post.content);
    assert.equal($('.katex-error').length, 0, post.relative);
    if (!post.source.includes('{% katex')) assert.equal($('.katex').length, 0, post.relative);
  }
});

test('migrated images use remote URLs and are absent from the blog source', async () => {
  const images = JSON.parse(await fs.readFile('content/image-migration.json', 'utf8'));
  assert.equal(images.length, 272);
  const oldUrls = new Set(images.map(image => image.originalUrl).filter(Boolean));
  for (const image of images) {
    assert.match(image.url, /^https:\/\/media\.githubusercontent\.com\/media\/chuzcjoe\/blog_imgs\/refs\/heads\/master\//);
    await assert.rejects(fs.access(image.source), image.source);
  }
  for (const post of [...result.site.posts, ...result.site.pages]) {
    const $ = load(post.content);
    for (const image of $('img[src]').toArray()) {
      const url = new URL($(image).attr('src'), new URL(post.url, config.url));
      assert.ok(url.origin !== new URL(config.url).origin || !oldUrls.has(decodeURIComponent(url.pathname)), `${post.relative}: ${url}`);
    }
  }
});

test('every original math article retains identical TeX, layout containers and legacy KaTeX HTML', async () => {
  const reference = JSON.parse(await fs.readFile('tests/fixtures/math-reference.json', 'utf8'));
  assert.equal(Object.keys(reference.pages).length, 21);
  for (const [url, expected] of Object.entries(reference.pages)) {
    const post = result.site.posts.find(p => p.url === url);
    assert.ok(post, url);
    assert.deepEqual(mathReference(post.content), expected, url);
  }
});

test('Softmax algorithm has seven rows and an inter-term space, with no extra row breaks', () => {
  const post = result.site.posts.find(p => p.slug === 'misc-online-softmax');
  const algorithm = mathReference(post.content).tex.find(tex => tex.includes('\\begin{array}'));
  assert.equal((algorithm.match(/\\\\/g) || []).length, 6);
  assert.ok(algorithm.includes(String.raw`\ell\,e`));
  assert.ok(!algorithm.includes(String.raw`\ell\\,e`));
  assert.match(post.content, /MathJax|\$\$/);
  assert.ok(!post.content.includes('katex'));
});

test('ordinary math keeps original Markdown escaping, while code remains literal', () => {
  const md = createMarkdown();
  const math = md.render(String.raw`$$\begin{array}{rl}1 & a \\\\ 2 & b\end{array}$$`);
  assert.ok(load(math).text().includes(String.raw`1 & a \\ 2 & b`));
  const code = md.render('```tex\n' + String.raw`$x_i$ \\\\ \( literal \)` + '\n```');
  assert.ok(load(code)('.code').text().includes(String.raw`$x_i$ \\\\ \( literal \)`));
});

test('old date and flat-file links redirect to the canonical post', async () => {
  const p = result.site.posts.find(p => p.date <= '2025-02-27');
  for (const f of [`${p.slug}.html`, `${p.date.replaceAll('-', '/')}/${p.slug}/index.html`]) {
    const $ = load(await fs.readFile(path.join('dist', f), 'utf8'));
    assert.equal($('link[rel=canonical]').attr('href'), new URL(p.url, config.url).href);
    assert.ok($('meta[http-equiv=refresh]').attr('content').includes(p.url));
    assert.equal($('body a').attr('href'), p.url);
  }
});

test('SEO canonical links, feed, robots and sitemap use the production domain', async () => {
  const $ = await html('/page/2/'); assert.equal($('link[rel=canonical]').attr('href'), config.url + '/page/2/');
  const json = JSON.parse(await fs.readFile('dist/content.json', 'utf8'));
  assert.equal(json.posts.length, 284); assert.equal(json.tags.length, 225);
  assert.ok(json.posts.some(p => p.title.includes('C++')));
  const xml = load(await fs.readFile('dist/sitemap.xml', 'utf8'), { xmlMode: true });
  const urls = xml('loc').toArray().map(e => xml(e).text());
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.every(url => new URL(url).origin === config.url));
  assert.ok(urls.includes(config.url + '/'));
  for (const post of [...result.site.posts, ...result.site.pages]) assert.ok(urls.includes(new URL(post.url, config.url).href), post.url);
  assert.equal(urls.length, 1 + result.site.posts.length + result.site.pages.length);
  assert.ok(!urls.some(url => /^\/(?:page|archives|categories|tags)\//.test(new URL(url).pathname)));
  await fs.access('dist/page/21/index.html');
  const oldPost = result.site.posts.find(p => p.date <= '2025-02-27');
  assert.ok(!urls.includes(new URL(`/${oldPost.slug}.html`, config.url).href));
  assert.ok(!urls.includes(config.url + '/404.html'));
  const robots = await fs.readFile('dist/robots.txt', 'utf8');
  assert.ok(robots.includes(`Sitemap: ${config.url}/sitemap.xml`));
  assert.ok(!robots.includes('chuzcjoe.com'));
  const feed = load(await fs.readFile('dist/atom.xml', 'utf8'), { xmlMode: true });
  assert.ok(feed('entry > link').toArray().every(e => feed(e).attr('href').startsWith(config.url + '/')));
});

test('production output contains no live-reload client or Hexo runtime dependency', async () => {
  const $ = await html('/'); assert.ok(!$.html().includes('/__events'));
  const lock = JSON.parse(await fs.readFile('package-lock.json', 'utf8'));
  assert.ok(Object.keys(lock.packages).every(p => !/(?:^|\/)hexo(?:-|\/|$)/.test(p)));
  await assert.rejects(fs.access('dist/Project.json'));
  await assert.rejects(fs.access('dist/_drafts'));
  await assert.rejects(fs.access('dist/vendor/mathjax/test'));
});

async function withFixture(fn) {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'joechu-blog-test-'));
  try { await fs.mkdir(path.join(temp, 'content/_posts'), { recursive: true }); await fs.copyFile(path.join(root, 'site.config.yml'), path.join(temp, 'site.config.yml')); await fs.cp(path.join(root, 'templates'), path.join(temp, 'templates'), { recursive: true }); await fn(temp); }
  finally { await fs.rm(temp, { recursive: true, force: true }); }
}

test('a pure Markdown file becomes an article without commands or front matter', async () => withFixture(async temp => {
  await fs.mkdir(path.join(temp, 'content/_posts/cpp'));
  await fs.writeFile(path.join(temp, 'content/_posts/cpp/2026-10-14-hello.md'), '# Hello Markdown\n\nWrite a file and publish it.\n');
  const site = await loadContent(temp, config), p = site.posts[0];
  assert.equal(p.title, 'Hello Markdown'); assert.equal(p.date, '2026-10-14'); assert.equal(p.url, '/cpp/hello/'); assert.deepEqual(p.categories, ['cpp']);
  assert.ok(!p.content.includes('<h1')); assert.match(p.content, /Write a file/);
}));

test('front matter overrides automatic values and unpublished posts remain excluded', async () => withFixture(async temp => {
  await fs.writeFile(path.join(temp, 'content/_posts/hello.md'), '---\ntitle: Custom title\ndate: 2026-10-14 12:00:00\ncategories: misc\ntags: [C++, 博客]\n---\n\nIntro\n\n<!-- more -->\n\n## Details\n\nText');
  await fs.writeFile(path.join(temp, 'content/_posts/private.md'), '---\ndraft: true\n---\nPrivate');
  const site = await loadContent(temp, config); assert.equal(site.posts.length, 1);
  const p = site.posts[0]; assert.equal(p.title, 'Custom title'); assert.equal(p.url, '/misc/hello/'); assert.deepEqual(p.tags, ['C++', '博客']);
  assert.match(p.excerpt, /Intro/); assert.doesNotMatch(p.excerpt, /Details/); assert.match(p.content, /id="more"/);
}));

test('legacy math tags and assets work alongside normal Markdown', () => {
  const rendered = createMarkdown().render(preprocess('{% katex %}x^2{% endkatex %}\n\n![Figure]({% asset_path chart.svg %})', '/misc/test/'));
  assert.match(rendered, /class="katex/); assert.match(rendered, /src="\/misc\/test\/chart.svg"/); assert.ok(!rendered.includes('{%'));
});

test('date defaults are deterministic across machine timezones', () => {
  const p = result.site.posts.find(p => p.slug === 'misc-online-softmax');
  assert.equal(p.dateIso, '2026-10-06T04:45:46.000Z'); assert.equal(p.updated, '2026-10-05');
});

test('build rejects route collisions before replacing any output', async () => withFixture(async temp => {
  const text = '---\nslug: collision\ncategories: misc\ndate: 2026-10-14\n---\nTest';
  await fs.writeFile(path.join(temp, 'content/_posts/one.md'), text); await fs.writeFile(path.join(temp, 'content/_posts/two.md'), text);
  await assert.rejects(build({ root: temp, assets: false }), /Route collision/);
}));

test('invalid Markdown metadata preserves the last successful output, and deletion removes routes', async () => withFixture(async temp => {
  const file = path.join(temp, 'content/_posts/hello.md');
  await fs.writeFile(file, '---\ncategories: misc\ndate: 2026-10-14\n---\nHello');
  await build({ root: temp, assets: false });
  const previous = await fs.readFile(path.join(temp, 'dist/index.html'), 'utf8');
  await fs.writeFile(file, '---\ntitle: [broken\n---\nHello');
  await assert.rejects(build({ root: temp, assets: false }));
  assert.equal(await fs.readFile(path.join(temp, 'dist/index.html'), 'utf8'), previous);
  await fs.rm(file); await build({ root: temp, assets: false });
  await assert.rejects(fs.access(path.join(temp, 'dist/misc/hello/index.html')));
}));
