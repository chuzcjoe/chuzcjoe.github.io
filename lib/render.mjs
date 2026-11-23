import fs from 'node:fs/promises';
import path from 'node:path';
import ejs from 'ejs';
import { escape, routePart } from './content.mjs';

export async function createRenderer(root, config, site, { live = false } = {}) {
  const visitHistory = JSON.parse(await fs.readFile(path.join(root, 'content/visit-history.json'), 'utf8').catch(error => {
    if (error.code === 'ENOENT') return '{}';
    throw error;
  }));
  const templates = {};
  for (const name of ['layout', 'article', 'widgets', 'listing', 'extras']) {
    templates[name] = ejs.compile(await fs.readFile(path.join(root, 'templates', `${name}.ejs`), 'utf8'), { filename: name });
  }
  const render = (name, data) => templates[name]({ config, site, visitHistory, escape, routePart, render, live, ...data });
  return (page, body) => {
    const widgets = page.article?.widgets ?? config.widgets;
    const left = widgets.filter(w => w.position === 'left');
    const right = widgets.filter(w => w.position === 'right');
    const main = page.url === '/' ? widgets.filter(w => w.position === 'main') : [];
    const columns = 1 + Number(left.length > 0) + Number(right.length > 0);
    const canonical = new URL(page.url, config.url).href;
    const context = { page, left, right, main, columns, canonical };
    const content = typeof body === 'string' ? body : body({ render, ...context });
    return '<!DOCTYPE html>\n' + render('layout', { ...context, content });
  };
}

export function paginate(posts, perPage = 10) {
  return Array.from({ length: Math.max(1, Math.ceil(posts.length / perPage)) }, (_, i) => posts.slice(i * perPage, (i + 1) * perPage));
}

export function pagination(base, current, total) {
  if (total <= 1) return '';
  const url = i => i === 1 ? base : `${base}page/${i}/`;
  const items = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(i - current) <= 1) items.push(i);
  }
  const result = [];
  let last = 0;
  for (const i of items) {
    if (i - last === 2) result.push(`<li><a class="pagination-link" href="${url(i - 1)}">${i - 1}</a></li>`);
    else if (last && i - last > 2) result.push('<li><span class="pagination-ellipsis">&hellip;</span></li>');
    result.push(`<li><a class="pagination-link${i === current ? ' is-current' : ''}" href="${url(i)}">${i}</a></li>`);
    last = i;
  }
  return `<nav class="pagination" role="navigation" aria-label="pagination"><div class="pagination-previous${current === 1 ? ' is-invisible is-hidden-mobile' : ''}"><a href="${url(Math.max(1, current - 1))}">Previous</a></div><div class="pagination-next${current === total ? ' is-invisible is-hidden-mobile' : ''}"><a href="${url(Math.min(total, current + 1))}">Next</a></div><ul class="pagination-list is-hidden-mobile">${result.join('')}</ul></nav>`;
}

export function tocHtml(headings, widget) {
  const roots = [], stack = [];
  for (const h of headings.filter(h => h.level <= (widget.depth ?? 3))) {
    const node = { ...h, children: [] };
    while (stack.length && stack.at(-1).level >= h.level) stack.pop();
    (stack.length ? stack.at(-1).children : roots).push(node);
    stack.push(node);
  }
  const build = (nodes, prefix = '') => '<ul class="menu-list">' + nodes.map((h, i) => {
    const number = prefix + (i + 1);
    return `<li><a class="level is-mobile" href="#${escape(h.id)}"><span class="level-left">${widget.index !== false ? `<span class="level-item">${number}</span>` : ''}<span class="level-item">${escape(h.text)}</span></span></a>${h.children.length ? build(h.children, number + '.') : ''}</li>`;
  }).join('') + '</ul>';
  return roots.length ? build(roots) : '';
}
