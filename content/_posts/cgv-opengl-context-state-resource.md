---
title: Context, State and Resource in OpenGL
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
date: 2025-03-03 21:44:23
tags: [opengl]
categories:
- CGV
---

OpenGL is fundamentally a state machine, and these three concepts—Context, State, and Resource—play a crucial role in its operation.

<!-- more -->

# 1. Introduction

**Context**
An OpenGL context is an encapsulation of the OpenGL state and resources tied to a specific rendering instance (like a window). It is created and managed by the windowing system (e.g., GLFW, GLUT, WGL, GLX, EGL).

**State**
OpenGL is a state machine, meaning it remembers configurations until explicitly changed.

**Resource**
OpenGL resources refer to objects that get created on GPU and store data used for rendering.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/opengl-context-state-resource/single-context.png" title="Image 1" width="800px" height="600px">
</p>

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/opengl-context-state-resource/pipeline.png" title="Image 1" width="300px" height="300px">
</p>

At its core, OpenGL maintains all states and buffer bindings. When a drawing command is issued, it relies on the current state of these settings to determine what and how to render. As illustrated in the flowchart above, modifying its static state or buffer bindings—whether for existing or newly created buffers—directly affects the rendering output. This characteristic makes OpenGL a state machine, as its rendering results depend on its current state.

# 2. Shared Context

A shared OpenGL context allows multiple OpenGL contexts to share certain GPU resources, such as textures, buffers, shaders, and VAOs, across different threads or windows. This enables efficient resource management and avoids redundant duplication of data.

While the context can be shared across threads/windows, each thread/window should maintain its own state, which means that the states are not shared.

It is worth noting that `FBOs` are not shared across OpenGL contexts. They are context-specific objects designed to handle off-screen rendering for a specific OpenGL context.


<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/opengl-context-state-resource/shared-context.png" title="Image 1" width="800px" height="600px">
</p>

