import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createPost } from '../scripts/new-post.mjs';
import { loadContent, readConfig } from '../lib/content.mjs';

async function fixture(fn) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-new-post-'));
  try {
    await fs.copyFile('site.config.yml', path.join(root, 'site.config.yml'));
    await fn(root, await readConfig(root));
  } finally { await fs.rm(root, { recursive: true, force: true }); }
}

test('new post preserves YAML-sensitive titles, tags and site-local time and loads as a normal article', () => fixture(async (root, config) => {
  const title = 'C++: "引用" 与指针';
  const created = await createPost({ root, title, category: 'cpp', slug: 'pointer-notes', tags: ['C++', 'notes', 'C++'], now: new Date('2026-10-19T01:30:00Z') });
  assert.equal(created.relative, 'content/_posts/cpp-pointer-notes.md');
  const site = await loadContent(root, config);
  assert.equal(site.posts.length, 1);
  const post = site.posts[0];
  assert.equal(post.title, title);
  assert.equal(post.author, config.author);
  assert.equal(post.url, created.url);
  assert.equal(post.date, '2026-10-18');
  assert.equal(post.dateIso, '2026-10-19T01:30:00.000Z');
  assert.deepEqual(post.categories, ['cpp']);
  assert.deepEqual(post.tags, ['C++', 'notes']);
  assert.match(post.excerpt, /在这里写摘要/);
  assert.doesNotMatch(post.excerpt, /在这里开始写作/);
  assert.ok(post.headings.some(h => h.text === '正文'));
}));

test('creating the same filename never overwrites an existing article', () => fixture(async root => {
  const created = await createPost({ root, title: 'First', slug: 'duplicate' });
  await fs.appendFile(created.file, '\nAlready written content.\n');
  const before = await fs.readFile(created.file, 'utf8');
  await assert.rejects(createPost({ root, title: 'Second', slug: 'duplicate' }), /文章已存在，未覆盖/);
  assert.equal(await fs.readFile(created.file, 'utf8'), before);
}));

test('default names support Chinese and draft posts remain unpublished', () => fixture(async (root, config) => {
  const visible = await createPost({ root, title: '我的第一篇文章' });
  assert.equal(visible.relative, 'content/_posts/misc-我的第一篇文章.md');
  await createPost({ root, title: 'Private notes', draft: true });
  const site = await loadContent(root, config);
  assert.deepEqual(site.posts.map(p => p.title), ['我的第一篇文章']);
}));

test('missing titles and explicit directory paths fail before writing a post', () => fixture(async root => {
  await assert.rejects(createPost({ root, title: ' ' }), /请提供文章标题/);
  await assert.rejects(createPost({ root, title: 'Test', slug: '../../outside' }), /不能包含目录路径/);
  await assert.rejects(fs.access(path.join(root, 'content/_posts')));
}));
