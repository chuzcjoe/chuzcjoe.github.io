# JoeChu Blog

原博客的独立 Markdown 版本。保留 Icarus UI、全部文章、图片/PDF、路由及主要交互；安装、构建、预览、发布均不依赖 Hexo，也不读取旧项目目录。

## 本地运行

需要 Node.js 22 或更高版本。

```sh
npm ci
npm run dev
```

打开 http://localhost:4321/ 。修改、新增或删除 Markdown 后会自动重新生成页面并刷新浏览器。端口可用 `npm run dev -- --port 4323` 调整。

## 写一篇文章

可以用快捷命令创建文章模板：

```sh
npm run new -- "My New Post"
npm run new -- "Smart Pointer Notes" --category cpp --tags "C++,notes"
npm run new -- "中文标题" --slug my-post --category life --draft
```

默认分类为 `misc`，文件按现有的“分类-文章名.md”方式命名；例如第二条命令创建 `content/_posts/cpp-smart-pointer-notes.md`。模板包含标题、作者、站点时区的当前日期、分类、标签、目录开关、摘要分隔符和正文。中文标题可直接使用，也可以通过 `--slug` 指定英文文件名部分。已有同名文件会报错，不会覆盖。

`--draft` 会在元信息中写入 `draft: true`；准备发布时改为 `false` 或删除该项。运行 `npm run dev` 后，创建的普通文章会自动出现在本地预览中。运行 `npm run new -- --help` 查看完整用法。

直接在 `content/_posts/` 中新建 `my-post.md`，例如：

```md
---
title: 我的新文章
date: 2026-10-14 20:00:00
categories: cpp
tags: [C++, notes]
---

这是首页显示的摘要。

<!-- more -->

## 正文

直接写 Markdown。支持代码、表格、HTML、图片和 $E=mc^2$ 公式。
```

对应网址是 `/cpp/my-post/`。不需要创建文章命令，不需要在路由清单里注册。生产版本在下次构建时自动包含它。

元信息是可选的。也可以新建 `content/_posts/cpp/2026-10-14-hello.md`：

```md
# Hello Markdown

直接开始写正文。
```

这会得到标题 `Hello Markdown`、日期 `2026-10-14`、分类 `cpp`、网址 `/cpp/hello/`。省略日期时使用文件修改日期；为了跨电脑/重新克隆后日期稳定，建议在文件名或元信息中写日期。省略分类时先取 `_posts` 下的第一层目录，否则归入 `uncategorized`；省略作者时使用 Joe Chu。纯 Markdown 的首个一级标题用于页面标题，不重复显示。

- 图片上传到 `chuzcjoe/blog_imgs`，按 `分类/文章名/图片名` 保存并使用 Git LFS，例如 `cpp/my-post/diagram.png`。正文直接使用 `![说明](https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cpp/my-post/diagram.png)`；文件名中的空格等字符需要 URL 编码。也支持 HTML、GIF、PDF 和视频嵌入。构建器仍支持同名附件目录，PDF 等现有附件继续随博客保存。
- 用 `<!-- more -->` 分隔摘要和正文。没有此标记时，列表页显示完整正文，与原站一致。
- `$...$` 是行内公式，`$$...$$` 是独立公式；旧文章中的公式和资源标签继续兼容，新文章无需这些标签。
- `sticky: 100` 将文章置顶；`toc: false` 关闭目录。没有目录配置时文章默认启用目录。
- `draft: true` 或 `published: false` 隐藏文章；`content/_drafts/` 保留原有 7 篇草稿，不会发布。
- “私房菜”页面仍直接编辑 `content/about/index.md`。

公式沿用原站的处理顺序和版本：Marked 4.3.0 先完成 Markdown 转义，再由浏览器中的 MathJax 2.7.9 排版，配置仍为 `TeX-MML-AM_CHTML`。旧文章的 `{% katex %}` 标签保持原来的 KaTeX 0.16.21 服务端输出及 0.12.0 样式。所需脚本、字体和样式均随站点提供。正文中的 LaTeX 换行 `\\` 在 Markdown 源码中需要写成 `\\\\`，与原站相同；代码块中的反斜杠不受影响。

## 配置和目录

- `site.config.yml`：站点信息、导航、默认头像/侧栏、第三方服务。所有文章左侧头像统一使用此处左侧 `profile` 的 `avatar`，与主页保持一致。
- `content/_posts/`：284 篇原文及文章附件；原有的逐文章 `widgets` 配置继续有效。
- `content/dates.json`：迁移时保留的原始日期，防止复制文件或重新克隆后历史日期变化；文章元信息中的日期优先。
- `content/tag-routes.json`：保留现有标签 URL，新标签自动生成。
- `content/image-migration.json`：272 张图片的原路径、图床链接、文件大小和 SHA-256，用于迁移核验。
- `static/`：原站样式、浏览器脚本及站点公共图片。头像 `static/img/site/renderme.png`、Logo 和 favicon 共用的 `static/img/site/expert.png` 随站点部署，通过本站 `/img/site/` 地址加载；文章图片继续引用 GitHub 图片库。
- `templates/` 和 `lib/`：独立模板和 Markdown/路由生成器。
- `dist/`：生产静态站点；`.dev/`：开发输出。两者都是可重新生成的产物，不要直接编辑。

保留首页置顶和分页、分类/标签及分页、按年/月归档、个人侧栏和文章侧栏、文章前后导航、阅读时间、目录追踪/移动端目录、搜索高亮和键盘导航、代码高亮/复制/折叠、图片灯箱、夜间模式、返回顶部、进入动画、Cookie 提示、Atom、sitemap、manifest、canonical/Open Graph/结构化数据、网站所有权验证文件和 362 个历史网址跳转。第三方静态库随构建复制到站点内，字体/图标和公式无需在线 CDN 才能显示。

## 第三方服务

保留原有 Disqus shortname、canonical URL/identifier、Busuanzi 兼容计数、follow.it 表单及 PayPal 配置。计数沿用旧站的 `busuanzi.ibruce.info` 服务及 `busuanzi_value_*` 标签，继续读取原域名和页面路径的历史累计数据；外部服务的实际响应仍取决于其可用性和账户设置，验证不会发送评论、订阅或付款。AdSense 保留原广告位和 Advertisement 占位，发布商账号为 `ca-pub-1486482663275315`，侧栏广告单元为 `5727003811`，首页顶部横幅广告单元为 `6708912999`。凭证为空时不会加载广告脚本。`content/ads.txt` 已按站点所有者提供的信息配置授权记录，构建后发布至 `https://www.chuzcjoe.com/ads.txt`。

重新接入 AdSense 时，在 `site.config.yml` 的 `type: adsense` 项填写 `client_id` 和 `slot_id`，各文章的广告位默认继承这组配置，也可在文章的同名字段中单独覆盖。本地预览始终保留占位，不加载广告；凭证完整时线上会加载广告。需要 ads.txt 授权时，将新账户提供的记录放入 `content/ads.txt`，构建后会复制到网站根目录。

首页中间列顶部的横幅广告由 `position: main` 的 `adsense` 项配置，与文章卡片等宽，广告内容高度为 50px，含标题和内边距的整体高度为 67px，仅首页显示。默认继承左侧广告的账户和广告单元配置，也可在此项单独填写 `client_id`、`slot_id`。

原配置的 ShareThis 安装地址实际上指向博客首页，无法加载分享控件，因此替换为可工作的 X/Facebook/LinkedIn 分享入口和浏览器原生分享。原目录没有 `/img/wechat.jpg`，Alipay 的二维码也未配置：按钮保留并提示未配置；将真实二维码上传图片库后，在 `site.config.yml` 填写其 URL 即可启用。没有伪造二维码。原站未加载的夜间样式现在正常加载；页脚保留 Icarus 署名，构建器署名改为 Markdown。

原博客和新博客本地预览中看到的访问计数不代表线上真实流量；第三方统计不作为功能验收依据。

## 验证和生产构建

```sh
npm test
npm run check
npm run check:math
npm run check:images
npm run build
npm run preview
```

`npm test` 会构建站点并检查迁移数量、1,043 条原始 HTML 路径、代表页面结构/内容顺序、分页、公式、历史跳转、SEO、纯 Markdown 写作和构建失败恢复。公式回归覆盖 Softmax 算法的七行结构、间距，以及 21 篇相关文章的原始公式输入、HTML 容器和 17 个旧 KaTeX 输出。`npm run check:math` 可单独对照这些原站基准；`npm run check` 检查生成页面的本地资源引用。开发服务运行时，`npm run test:dev` 会新增和删除一篇临时文章，检查页面、搜索和 Feed 自动更新，然后清除测试内容。

`npm run check:images` 联网检查迁移清单中的全部图片，要求返回 HTTP 200、正确的图片类型，并与原文件大小、SHA-256 一致。结果写入 `.artifacts/image-remote-audit.json`。

## GitHub Pages 自动部署

正式地址为 https://www.chuzcjoe.com/，源码仓库为 `chuzcjoe/chuzcjoe.github.io`，默认分支为 `main`。

日常发布只需提交源码并推送：

```sh
git add .
git commit -m "Update blog"
git push origin main
```

`.github/workflows/pages.yml` 在每次推送 `main` 时使用 Node.js 22 和 `npm ci` 安装锁定依赖，运行完整回归测试（含生产构建）及本地资源检查，再将 `dist/` 通过 GitHub Pages 官方 Actions 发布。测试失败时不会部署。也可以在 Actions 中手动运行 Deploy GitHub Pages。Pull request 只执行检查，不部署。

GitHub 仓库 Settings → Pages 的 Source 应为 **GitHub Actions**；`github-pages` environment 的部署分支规则允许 `main`。工作流使用仓库内置的 `GITHUB_TOKEN` 和 OIDC，无需添加部署密钥或个人 token。`dist/` 不提交到 Git，旧的 `joe` 和 `master` 分支保留作为历史记录，不再用于发布。已移除会覆盖旧发布分支的 `npm run deploy` 脚本。

`site.config.yml` 的 `url` 和 `static/robots.txt` 均指向正式域名 `https://www.chuzcjoe.com`。GitHub Pages 的 Custom domain 设置为 `www.chuzcjoe.com`；Cloudflare 的根域名和 `www` 均指向 `chuzcjoe.github.io`，使用 DNS only。Actions 部署不需要 CNAME 文件。旧 GitHub Pages 地址及根域名由 GitHub 跳转至正式域名。构建自动生成 sitemap、Atom、canonical 和 Open Graph 地址。新增或删除文章后，下次推送会同步更新。可在 Google Search Console 对应资源中提交 `https://www.chuzcjoe.com/sitemap.xml`。

Icarus 样式与浏览器交互的 MIT 授权保存在 `licenses/`。
