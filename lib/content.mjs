import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import YAML from 'yaml';
import moment from 'moment-timezone';
import { marked } from 'marked';
import katex from 'katex';
import hljs from 'highlight.js';
import { load } from 'cheerio';

export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const slugify = value => String(value).normalize('NFD').replace(/\p{M}/gu, '').replace(/[\u0000-\u001f]/g, '').replace(/[\s~`!@#$%^&*()\-_+=[\]{}|\\;:"'<>,.?/]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
export const routePart = value => encodeURIComponent(slugify(value));
export const list = value => (Array.isArray(value) ? value.flat(Infinity) : value == null ? [] : [value]).map(String);

export async function filesIn(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(e => { if (e.code === 'ENOENT') return []; throw e; });
  const result = await Promise.all(entries.filter(e => !e.name.startsWith('.')).map(e => e.isDirectory() ? filesIn(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  return result.flat().sort();
}

export async function readConfig(root) {
  return YAML.parse(await fs.readFile(path.join(root, 'site.config.yml'), 'utf8'));
}

export function createMarkdown() {
  return { render(source) {
    // The original site used Marked 4.3.0 BEFORE MathJax, including its
    // backslash escapes, emphasis, smart punctuation and hard line breaks.
    // Do not intercept $…$ / $$…$$ or normalize TeX ahead of that parser.
    const renderer = new marked.Renderer();
    const headingIds = new Map();
    renderer.heading = (text, level) => {
      const plain = load(text, null, false).text();
      const base = slugify(plain);
      const count = headingIds.get(base) || 0;
      headingIds.set(base, count + 1);
      const id = base + (count ? `-${count}` : '');
      return `<h${level} id="${escape(id)}"><a href="#${escape(id)}" class="headerlink" title="${escape(plain)}"></a>${text}</h${level}>\n`;
    };
    renderer.code = (text, info = '') => {
      const [language = '', ...caption] = info.trim().split(/\s+/);
      const lang = hljs.getLanguage(language) ? language : 'plaintext';
      const code = hljs.highlight(text.replace(/\n$/, ''), { language: lang }).value;
      const lines = code.split('\n');
      return `<figure class="highlight ${escape(language)}">${caption.length ? `<figcaption><span>${escape(caption.join(' '))}</span></figcaption>` : ''}<table><tbody><tr><td class="gutter"><pre>${lines.map((_, i) => `<span class="line">${i + 1}</span>`).join('<br>')}</pre></td><td class="code"><pre>${lines.map(line => `<span class="line">${line || ' '}</span>`).join('<br>')}</pre></td></tr></tbody></table></figure>\n`;
    };
    const html = marked.parse(source, { renderer, gfm: true, pedantic: false, breaks: true, smartLists: true, smartypants: true, mangle: false, headerIds: false });
    // Legacy KaTeX tags bypassed Markdown in the original site. Expand only
    // their opaque placeholders AFTER parsing; ordinary formulas stay text.
    return html.replace(/<span data-legacy-katex="([A-Za-z0-9+/=]*)"><\/span>/g, (_, encoded) =>
      katex.renderToString(Buffer.from(encoded, 'base64').toString('utf8'), { throwOnError: false }));
  } };
}

export function preprocess(body, assetUrl) {
  // Translate the only two legacy template tags used in the imported articles.
  // New articles use ordinary Markdown and $…$ / $$…$$ math.
  return body.replace(/{%\s*katex(?:\s+[^%]*)?\s*%}([\s\S]*?){%\s*endkatex\s*%}/g, (_, math) => {
    // Match the old tag body's common-indent and outer-newline handling.
    const indents = [...math.matchAll(/^[\t ]*(?=\S)/gm)].map(m => m[0].length);
    const indent = indents.length ? Math.min(...indents) : 0;
    const content = (indent ? math.replace(new RegExp(`^[\\t ]{${indent}}`, 'gm'), '') : math).replace(/^\n?|\n?$/g, '');
    return `<span data-legacy-katex="${Buffer.from(content).toString('base64')}"></span>`;
  })
    .replace(/{%\s*asset_path\s+([^%]+?)\s*%}/g, (_, name) => assetUrl + encodeURIComponent(name.trim().replace(/^['"]|['"]$/g, '')))
    .replace(/<!--\s*more\s*-->/i, '<span id="more"></span>');
}

export async function loadContent(root, config) {
  const md = createMarkdown();
  const contentDir = path.join(root, 'content');
  const allFiles = await filesIn(contentDir);
  const tagRoutes = JSON.parse(await fs.readFile(path.join(contentDir, 'tag-routes.json'), 'utf8').catch(() => '{}'));
  const dateDefaults = JSON.parse(await fs.readFile(path.join(contentDir, 'dates.json'), 'utf8').catch(() => '{}'));
  const posts = [], pages = [];
  for (const file of allFiles.filter(f => /\.md$/i.test(f))) {
    const relative = path.relative(contentDir, file).split(path.sep).join('/');
    if (relative.split('/').includes('_drafts')) continue;
    const text = await fs.readFile(file, 'utf8');
    const parsed = matter(text, { engines: { yaml: s => YAML.parse(s) ?? {} } });
    const data = parsed.data;
    if (data.draft === true || data.published === false) continue;
    const isPost = relative.startsWith('_posts/');
    const filename = path.basename(file, '.md');
    const subdir = path.dirname(relative).split('/').slice(1).filter(x => x !== '.');
    const categories = list(data.categories ?? data.category);
    if (isPost && !categories.length) categories.push(subdir[0] || 'uncategorized');
    const slug = data.slug || filename.replace(/^\d{4}-\d\d-\d\d-/, '');
    const url = isPost ? `/${categories.map(routePart).join('/')}/${encodeURIComponent(slug)}/` : `/${relative.replace(/(?:\/index)?\.md$/i, '').replace(/\/index$/, '')}/`;
    if (/[\\]/.test(url) || url.split('/').some(s => ['.', '..'].includes(decodeURIComponent(s)))) throw Error(`Unsafe route in ${relative}`);
    const stat = await fs.stat(file);
    const dateInput = data.date || filename.match(/^\d{4}-\d\d-\d\d/)?.[0] || dateDefaults[relative]?.date || stat.mtime;
    const date = moment.tz(dateInput, config.timezone);
    if (!date.isValid()) throw Error(`Invalid date in ${relative}: ${dateInput}`);
    const updated = moment.tz(data.updated || dateDefaults[relative]?.updated || stat.mtime, config.timezone);
    const source = parsed.content;
    const firstHeading = source.match(/^\s*#\s+(.+)(?:\r?\n|$)/);
    const bodySource = data.title == null && firstHeading ? source.slice(firstHeading[0].length) : source;
    const article = {
      ...data, file, relative, slug, url, isPost, categories, tags: list(data.tags),
      title: String(data.title ?? firstHeading?.[1] ?? filename),
      author: data.author ?? config.author, date: date.format('YYYY-MM-DD'), dateIso: date.toISOString(), timestamp: date.valueOf(),
      updated: updated.format('YYYY-MM-DD'), updatedIso: updated.toISOString(),
      source, assets: path.join(path.dirname(file), filename),
      widgets: data.widgets ?? config.widgets, toc: isPost ? data.toc !== false : data.toc === true,
    };
    const html = md.render(preprocess(bodySource, url));
    const $ = load(html, null, false);
    const localScripts = {
      'https://unpkg.com/heic2any': '/vendor/heic2any.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js': '/vendor/jszip.min.js',
    };
    $('script[src]').each((_, el) => {
      const local = localScripts[$(el).attr('src')];
      if (local) $(el).attr('src', local);
    });
    $('h1,h2,h3,h4,h5,h6').each((_, el) => {
      if (!$(el).attr('id')) $(el).attr('id', slugify($(el).text()));
    });
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (/^https?:\/\//.test(href) && !href.startsWith(config.url)) $(el).attr('target', '_blank').attr('rel', 'noopener');
    });
    article.content = $.html();
    article.headings = $('h1,h2,h3,h4,h5,h6').map((_, el) => ({ level: Number(el.tagName[1]), id: $(el).attr('id'), text: $(el).text() })).get();
    article.text = $.text().replace(/\s+/g, ' ').trim();
    const excerpt = bodySource.split(/<!--\s*more\s*-->/i);
    article.excerpt = excerpt.length > 1 ? md.render(preprocess(excerpt[0], url)) : '';
    article.description = String(data.description || load(article.excerpt || article.content).text().replace(/\s+/g, ' ').trim().slice(0, 200));
    article.words = (source.replace(/<\/?[a-z][^>]*>/gi, '').trim().match(/[\u00ff-\uffff]|[a-zA-Z]+/g) || []).length;
    article.readtime = moment.duration(article.words / 150 * 60, 'seconds').locale('en').humanize();
    (isPost ? posts : pages).push(article);
  }
  posts.sort((a, b) => b.timestamp - a.timestamp || a.slug.localeCompare(b.slug));
  const categories = new Map(), tags = new Map();
  for (const post of posts) {
    for (const name of post.categories) {
      if (!categories.has(name)) categories.set(name, { name, slug: slugify(name), url: `/categories/${routePart(name)}/`, posts: [] });
      categories.get(name).posts.push(post);
    }
    for (const name of post.tags) {
      if (!tags.has(name)) tags.set(name, { name, slug: slugify(name), url: tagRoutes[name] || `/tags/${routePart(name)}/`, posts: [] });
      tags.get(name).posts.push(post);
    }
  }
  const sorted = map => [...map.values()].sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const years = [...new Set(posts.map(p => p.date.slice(0, 4)))].sort().reverse().map(year => ({ year, posts: posts.filter(p => p.date.startsWith(year)) }));
  return { posts, pages, categories: sorted(categories), tags: sorted(tags), years, files: allFiles };
}
