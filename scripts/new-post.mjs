import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import moment from 'moment-timezone';
import YAML from 'yaml';
import { readConfig, routePart, slugify } from '../lib/content.mjs';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const help = `创建一篇 Markdown 博客文章：

  npm run new -- "文章标题"
  npm run new -- "Smart Pointer Notes" --category cpp --tags "C++,notes"
  npm run new -- "中文标题" --slug my-post --category life --draft

选项：
  -c, --category  分类，默认 misc
  -t, --tags      标签，使用英文逗号分隔
  -s, --slug      自定义文件名中的标题部分，默认根据标题生成
      --draft     创建草稿，设为 draft: false 后才会显示
  -h, --help      显示帮助
`;

export async function createPost({ root = projectRoot, title, category = 'misc', tags = [], slug, draft = false, now = new Date() }) {
  title = String(title ?? '').trim();
  category = String(category).trim();
  if (!title) throw Error('请提供文章标题，例如 npm run new -- "My New Post"');
  if (!category || !slugify(category)) throw Error('分类不能为空。');
  if (slug != null && /[/\\]/.test(slug)) throw Error('--slug 只能是文件名，不能包含目录路径。');
  const name = slugify(slug ?? title).toLowerCase();
  if (!name) throw Error('无法从标题生成文件名，请使用 --slug 指定。');
  const config = await readConfig(root);
  const date = moment(now).tz(config.timezone);
  const filename = `${slugify(category).toLowerCase()}-${name}`;
  const relative = `content/_posts/${filename}.md`;
  const file = path.join(root, relative);
  const metadata = {
    title, author: config.author, date: date.format('YYYY-MM-DD HH:mm:ss'),
    categories: [category], tags: [...new Set(tags.map(tag => String(tag).trim()).filter(Boolean))], toc: true,
    ...(draft ? { draft: true } : {}),
  };
  const content = `---\n${YAML.stringify(metadata)}---\n\n在这里写摘要。\n\n<!-- more -->\n\n## 正文\n\n在这里开始写作。\n`;
  await fs.mkdir(path.dirname(file), { recursive: true });
  try { await fs.writeFile(file, content, { flag: 'wx' }); }
  catch (error) {
    if (error.code === 'EEXIST') throw Error(`文章已存在，未覆盖：${file}。请换一个标题或使用 --slug。`);
    throw error;
  }
  return { file, relative, url: `/${routePart(category)}/${encodeURIComponent(filename)}/`, draft };
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      category: { type: 'string', short: 'c', default: 'misc' },
      tags: { type: 'string', short: 't', default: '' },
      slug: { type: 'string', short: 's' },
      draft: { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  if (values.help) { console.log(help); return; }
  const post = await createPost({ ...values, title: positionals.join(' '), tags: values.tags.split(',') });
  console.log(`已创建：${post.file}`);
  if (post.draft) console.log('这是草稿，将 front matter 中的 draft 改为 false 后会显示。');
  else console.log(`启动 npm run dev 后预览：http://localhost:4321${post.url}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
