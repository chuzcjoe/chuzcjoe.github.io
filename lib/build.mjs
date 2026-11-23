import fs from 'node:fs/promises';
import path from 'node:path';
import moment from 'moment-timezone';
import { readConfig, loadContent, escape, filesIn } from './content.mjs';
import { createRenderer, paginate, pagination, tocHtml } from './render.mjs';

const vendorCopies = [
  ['jquery/dist/jquery.min.js', 'jquery.min.js'], ['moment/min/moment-with-locales.min.js', 'moment.min.js'],
  ['clipboard/dist/clipboard.min.js', 'clipboard.min.js'], ['pace-js/pace.min.js', 'pace.min.js'],
  ['cookieconsent/build', 'cookieconsent'], ['lightgallery/dist', 'lightgallery'],
  ['justifiedGallery/dist/css/justifiedGallery.min.css', 'justifiedGallery/justifiedGallery.min.css'],
  ['justifiedGallery/dist/js/jquery.justifiedGallery.min.js', 'justifiedGallery/jquery.justifiedGallery.min.js'],
  ['@fortawesome/fontawesome-free/css/all.min.css', 'fontawesome/css/all.min.css'],
  ['@fortawesome/fontawesome-free/webfonts', 'fontawesome/webfonts'],
  ['highlight.js/styles/atom-one-light.css', 'highlight/atom-one-light.css'],
  ['katex-legacy-css/dist/katex.min.css', 'katex/katex.min.css'], ['katex-legacy-css/dist/fonts', 'katex/fonts'],
  ...['MathJax.js', 'unpacked', 'config', 'extensions', 'jax', 'localization', 'fonts'].map(name => [`mathjax/${name}`, `mathjax/${name}`]),
  ['heic2any/dist/heic2any.min.js', 'heic2any.min.js'], ['jszip/dist/jszip.min.js', 'jszip.min.js'],
];

async function copy(source, destination) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.cp(source, destination, { recursive: true, preserveTimestamps: true });
}

export async function build({ root = process.cwd(), outDir = 'dist', assets = true, live = false } = {}) {
  const started = performance.now();
  const out = path.resolve(root, outDir);
  if (out === root || !out.startsWith(root + path.sep)) throw Error('Build output must be inside the project, separate from source.');
  const config = await readConfig(root);
  const site = await loadContent(root, config);
  const renderPage = await createRenderer(root, config, site, { live });
  const routes = new Map();
  const add = (url, value) => {
    const file = decodeURIComponent(url.slice(1) + (url.endsWith('/') ? 'index.html' : ''));
    if (!file || file.split('/').some(p => p === '..' || p === '.') || file.includes('\\')) throw Error(`Invalid output route: ${url}`);
    if (routes.has(file)) throw Error(`Route collision: ${url}`);
    routes.set(file, value);
  };
  const articleView = (render, post, index, prev = null, next = null) => render('article', { post, index, prev, next });
  const addListing = (base, posts, title = '', taxonomy = null, name = '') => {
    const batches = paginate(posts, config.perPage);
    batches.forEach((batch, i) => {
      const url = i ? `${base}page/${i + 1}/` : base;
      add(url, renderPage({ url, title }, ({ render }) =>
        (taxonomy ? render('listing', { kind: 'breadcrumb', taxonomy, name }) : '') +
        batch.map(p => articleView(render, p, true)).join('') + pagination(base, i + 1, batches.length)));
    });
  };
  addListing('/', [...site.posts].sort((a, b) => (Number(b.sticky) || 0) - (Number(a.sticky) || 0) || b.timestamp - a.timestamp));
  for (const [i, post] of site.posts.entries()) {
    const page = { url: post.url, title: post.title, article: post, tocHtml: widget => tocHtml(post.headings, widget) };
    add(post.url, renderPage(page, ({ render }) => articleView(render, post, false, site.posts[i - 1], site.posts[i + 1])));
  }
  for (const post of site.pages) {
    add(post.url, renderPage({ url: post.url, title: post.layout === 'page' ? post.title : '', article: post, tocHtml: widget => tocHtml(post.headings, widget) }, ({ render }) => articleView(render, post, false)));
  }
  for (const kind of ['categories', 'tags']) {
    add(`/${kind}/`, renderPage({ url: `/${kind}/`, title: kind === 'categories' ? 'Categories' : 'Tags' }, ({ render }) => render('listing', { kind, items: site[kind] })));
    for (const item of site[kind]) addListing(item.url, item.posts, `${kind === 'categories' ? 'Category' : 'Tag'}: ${item.name}`, kind, item.name);
  }
  const addArchive = (base, posts, title, label = null) => {
    const batches = paginate(posts, config.perPage);
    batches.forEach((batch, i) => {
      const url = i ? `${base}page/${i + 1}/` : base;
      const groups = label ? [{ label, posts: batch }] : [...new Set(batch.map(p => p.date.slice(0, 4)))].map(year => ({ label: year, posts: batch.filter(p => p.date.startsWith(year)) }));
      add(url, renderPage({ url, title }, ({ render }) => render('listing', { kind: 'archive', groups }) + pagination(base, i + 1, batches.length)));
    });
  };
  addArchive('/archives/', site.posts, 'Archives');
  for (const { year, posts } of site.years) {
    addArchive(`/archives/${year}/`, posts, `Archives: ${year}`, year);
    for (const month of [...new Set(posts.map(p => p.date.slice(5, 7)))]) {
      addArchive(`/archives/${year}/${month}/`, posts.filter(p => p.date.slice(5, 7) === month), `Archives: ${year}/${Number(month)}`, moment(`${year}-${month}-01`).format('MMMM YYYY'));
    }
  }
  const redirectCount = { value: 0 };
  for (const post of site.posts.filter(p => p.date <= '2025-02-27')) {
    const aliases = [`/${post.date.replaceAll('-', '/')}/${encodeURIComponent(post.slug)}/`, `/${encodeURIComponent(post.slug)}.html`];
    for (const alias of aliases) {
      const file = decodeURIComponent(alias.slice(1) + (alias.endsWith('/') ? 'index.html' : ''));
      if (routes.has(file)) continue;
      add(alias, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=${escape(post.url)}"><link rel="canonical" href="${escape(new URL(post.url, config.url).href)}"><title>${escape(post.title)}</title></head><body><p>This article has moved to <a href="${escape(post.url)}">${escape(post.title)}</a>.</p><script>location.replace(${JSON.stringify(post.url).replace(/</g, '\\u003c')}+location.hash);</script></body></html>`);
      redirectCount.value++;
    }
  }
  add('/404.html', renderPage({ url: '/404.html', title: 'Page not found' }, '<div class="card"><div class="card-content"><h1 class="title is-3">404</h1><p>Page not found.</p><a class="button is-primary mt-4" href="/">Back to home</a></div></div>'));
  const search = {
    posts: site.posts.map(p => ({ title: p.title, text: p.text, link: p.url, date: p.dateIso })),
    pages: site.pages.map(p => ({ title: p.title, text: p.text, link: p.url })),
    categories: site.categories.map(c => ({ name: c.name, slug: c.slug, link: c.url })),
    tags: site.tags.map(c => ({ name: c.name, slug: c.slug, link: c.url })),
  };
  add('/content.json', JSON.stringify(search));
  const atom = `<?xml version="1.0" encoding="utf-8"?><feed xmlns="http://www.w3.org/2005/Atom"><title>${escape(config.title)}</title><subtitle>${escape(config.description)}</subtitle><link href="${escape(config.url)}/atom.xml" rel="self"/><link href="${escape(config.url)}/"/><id>${escape(config.url)}/</id><updated>${site.posts[0]?.updatedIso || new Date().toISOString()}</updated><author><name>${escape(config.author)}</name></author>${site.posts.slice(0, config.feedLimit).map(p => `<entry><title>${escape(p.title)}</title><link href="${escape(new URL(p.url, config.url).href)}"/><id>${escape(new URL(p.url, config.url).href)}</id><published>${p.dateIso}</published><updated>${p.updatedIso}</updated><summary>${escape(p.description)}</summary><content type="html">${escape(p.content.replace(/(src|href)="\//g, `$1="${config.url}/`))}</content>${p.categories.map(name => `<category term="${escape(name)}"/>`).join('')}</entry>`).join('')}</feed>`;
  add('/atom.xml', atom);
  // Submit content pages directly; listing routes remain available for browsing.
  const sitemapUrls = [...new Set(['/', ...site.posts.map(p => p.url), ...site.pages.map(p => p.url)])].map(url => new URL(url, config.url).href);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapUrls.map(url => `<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>`;
  add('/sitemap.xml', sitemap); add('/new-sitemap.xml', sitemap);
  add('/submit_urls.txt', site.posts.slice(0, 10).map(p => new URL(p.url, config.url).href).join('\n') + '\n');
  add('/manifest.json', JSON.stringify({ ...config.head.manifest, name: config.head.manifest.name || config.title, short_name: config.head.manifest.short_name || config.title, start_url: '/', icons: [{ src: config.head.favicon, sizes: 'any', type: 'image/png' }] }));

  // Finish rendering before touching output, so syntax errors keep the previous preview available.
  await fs.mkdir(out, { recursive: true });
  if (assets) {
    await copy(path.join(root, 'static'), out);
    // Only runtime assets belong in the site, not MathJax's upstream test pages.
    await fs.rm(path.join(out, 'vendor/mathjax'), { recursive: true, force: true });
    for (const [source, destination] of vendorCopies) await copy(path.join(root, 'node_modules', source), path.join(out, 'vendor', destination));
    await copy(path.join(root, 'licenses'), path.join(out, 'vendor/licenses/site'));
    for (const pkg of ['jquery', 'moment', 'clipboard', 'pace-js', 'cookieconsent', 'lightgallery', 'justifiedGallery', '@fortawesome/fontawesome-free', 'highlight.js', 'katex', 'katex-legacy-css', 'mathjax', 'heic2any', 'jszip']) {
      const packageDir = path.join(root, 'node_modules', pkg);
      const licenseFiles = (await fs.readdir(packageDir)).filter(name => /^(licen[sc]e|copying|copyright)(\.|$)/i.test(name));
      for (const file of licenseFiles) await copy(path.join(packageDir, file), path.join(out, 'vendor/licenses', pkg.replaceAll('/', '-'), file));
    }
    for (const file of site.files.filter(f => !path.relative(path.join(root, 'content'), f).startsWith('_') && !/\.(md|json)$/i.test(f))) {
      await copy(file, path.join(out, path.relative(path.join(root, 'content'), file)));
    }
    for (const p of [...site.posts, ...site.pages]) {
      if (!(await fs.stat(p.assets).catch(() => null))?.isDirectory()) continue;
      await copy(p.assets, path.join(out, decodeURIComponent(p.url.slice(1))));
    }
  }
  const previous = JSON.parse(await fs.readFile(path.join(out, '.build-manifest.json'), 'utf8').catch(() => '[]'));
  // Bound file IO rather than opening hundreds of files at once.
  const entries = [...routes];
  for (let i = 0; i < entries.length; i += 32) await Promise.all(entries.slice(i, i + 32).map(async ([file, value]) => {
    const target = path.join(out, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, value);
  }));
  for (const file of previous) if (!routes.has(file) && !file.includes('..')) await fs.rm(path.join(out, file), { force: true });
  await fs.writeFile(path.join(out, '.build-manifest.json'), JSON.stringify([...routes.keys()]));
  const result = { posts: site.posts.length, pages: site.pages.length, categories: site.categories.length, tags: site.tags.length, redirects: redirectCount.value, routes: routes.size, seconds: ((performance.now() - started) / 1000).toFixed(2), out };
  console.log(`Built ${result.posts} posts, ${result.pages} page, ${result.categories} categories, ${result.tags} tags; ${result.routes} files (${result.redirects} redirects) in ${result.seconds}s → ${outDir}/`);
  return { ...result, site, routes };
}
