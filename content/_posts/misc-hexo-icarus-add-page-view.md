---
title: Add Page View Count to Hexo Icarus Theme
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
date: 2025-02-21 21:12:34
tags: [hexo]
categories:
- misc
---

In the latest updates to Hexo Icarus theme, the page view count is not showing by default.

<!-- more -->

To add page view count at the footer section, we need to modify the code a little bit.

Modify `/node_modules/hexo-theme-icarus/layout/common/footer.jsx`
```js
showVisitorCounter,
visitorCounterTitle,
showPageViewCounter, // added
pageViewCounterTitle // added


{showVisitorCounter ? <br /> : null}
{showVisitorCounter ? <span id="busuanzi_container_site_uv"
                                dangerouslySetInnerHTML={{ __html: visitorCounterTitle }}></span> : null}

// added                                
{showPageViewCounter ? <br /> : null}
{showPageViewCounter ? <span id="busuanzi_container_site_pv"
                                dangerouslySetInnerHTML={{ __html: pageViewCounterTitle }}></span> : null}

showVisitorCounter: plugins && plugins.busuanzi === true,
        visitorCounterTitle: _p('plugin.visitor_count', '<span id="busuanzi_value_site_uv">0</span>'),
// added
showPageViewCounter: plugins && plugins.busuanzi === true,
        pageViewCounterTitle: _p('plugin.visit', '<span id="busuanzi_value_site_pv">0</span>')
```

Modify `node_modules/hexo-theme-icarus/languages/en.yml`
```yml
plugin:
    backtotop: 'Back to top'
    visit_count: '%s&nbsp;visits'
    visitor_count: 'uv %s'
    visit: 'pv %s'
```
