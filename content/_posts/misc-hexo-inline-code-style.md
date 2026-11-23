---
title: Hexo Inline Code Style
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/me.jpeg
    avatar_rounded: false
    gravatar: null
    follow_link: https://github.com/chuzcjoe
    social_links:
      Github:
        icon: fab fa-github
        url: https://github.com/chuzcjoe
      Linkedin:
        icon: fab fa-linkedin
        url: https://www.linkedin.com/in/joe-chu-1784b3179/
      Scholar:
        icon: fab fa-google
        url: https://scholar.google.com/citations?user=DCwJ1qcAAAAJ&hl=en
      Dribbble:
        icon: fab fa-dribbble
        url: https://dribbble.com
      RSS:
        icon: fas fa-rss
        url: /
  - position: left
    type: toc
    index: null
    collapsed: true
    depth: 3
  - position: left
    type: adsense
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2025-03-13 10:40:23
tags: [hexo]
categories:
- misc
---

Modify the default Hexo inline code style.

<!-- more -->

Hexo uses highlighted red text for inline code style which is pretty ugly from my perspective. We could modify the default style and replace it with more concise and professional code style.

If you are using Icarus Theme, you can go to `node_modules/hexo-theme-icarus/include/style/article.styl`, and apply the changes.

```css
code
    padding: 0
    background: transparent
    overflow-wrap: break-word
    &:not(pre > code)
        background-color: #f0f0f0
        color: #333333
        padding: 3px 4px
        border-radius: 5px
```
