---
title: GLAD Extensions
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/baby.png
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
date: 2026-01-24 21:44:17
tags: [opengles, glad]
categories:
- CGV
---

Fix missing extensions in OpenGLES

<!-- more -->

GLAD is a runtime loader-generator for Vulkan/GL/GLES/EGL/GLX/WGL. There is a great web tool to generate `glad.h` and `glad.cpp` files we need (https://glad.dav1d.de/).

Recently, i was using `GL_TIME_ELAPSED_EXT` in my code to do the time query of my opengl rendering task, but found that `GL_TIME_ELAPSED_EXT` is not defined. The main reason is that in OpenGLES, timer queries are not core, even in ES 3.2. They are extension-only. So if GLAD wasn’t generated with that extension enabled, the macro will simply not exist.

To fix this, we have to manually include the extension `GL_EXT_disjoint_timer_query`, which `GL_TIME_ELAPSED_EXT` comes from, when generating the GLAD files.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/glad/glad.png" title="Image 1" width="600px" height="300px">
</p>

Then, the generated `glad.h` file will contain the definition of `GL_TIME_ELAPSED_EXT`.
```cpp
#define GL_QUERY_COUNTER_BITS_EXT 0x8864
#define GL_CURRENT_QUERY_EXT 0x8865
#define GL_QUERY_RESULT_EXT 0x8866
#define GL_QUERY_RESULT_AVAILABLE_EXT 0x8867
#define GL_TIME_ELAPSED_EXT 0x88BF
#define GL_TIMESTAMP_EXT 0x8E28
#define GL_GPU_DISJOINT_EXT 0x8FBB
#ifndef GL_EXT_disjoint_timer_query
#define GL_EXT_disjoint_timer_query 1
```