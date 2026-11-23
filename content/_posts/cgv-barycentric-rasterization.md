---
title: Barycentric Rasterization
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
date: 2025-10-09 22:33:34
tags: [rasterization, vulkan]
categories:
- CGV
---

Achieving rasterization with BaryCentric Coordinate.

<!-- more -->

# 1. Introduction

<iframe src="https://drive.google.com/file/d/1g7xmxkOkt8iXkl-cEmdNSUOrrVDFEQPG/preview" width="100%" height="2000"></iframe>

# 2. Implementation

We are implementing barycentric-based rasterization using Vulkan compute shader.
Code is available at: https://github.com/chuzcjoe/CORE/tree/master/examples/vulkan/ComputeBarycentricRasterizer

The core part is the shader implementation. This is identical to the math above.
```glsl
#version 450

layout(binding = 0) uniform UniformBufferObject {
    int width;
    int height;
    vec2 vertex_a;
    vec2 vertex_b;
    vec2 vertex_c;
}
ubo;

layout(std430, binding = 1) buffer rasterize_in_out { int rasterize[]; };

layout(local_size_x = 16, local_size_y = 16, local_size_z = 1) in;

int CalArea(ivec2 p1, ivec2 p2, ivec2 p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
}

bool BaryCentric(ivec2 pos) {
    ivec2 p1 = ivec2(ubo.vertex_a);
    ivec2 p2 = ivec2(ubo.vertex_b);
    ivec2 p3 = ivec2(ubo.vertex_c);

    int area1 =  CalArea(p1, p2, pos);
    int area2 = CalArea(p2, p3, pos);
    int area3 = CalArea(p3, p1, pos);

    return area1 >= 0 && area2 >= 0 && area3 >= 0;
}

void main() {
    ivec2 gid = ivec2(gl_GlobalInvocationID.xy);
    const int row = gid.y;
    const int col = gid.x;
    if (row >= ubo.height || col >= ubo.width) return;

    int ax = ivec2(ubo.vertex_a).x;
    int ay = ivec2(ubo.vertex_a).y;
    int bx = ivec2(ubo.vertex_b).x;
    int by = ivec2(ubo.vertex_b).y;
    int cx = ivec2(ubo.vertex_c).x;
    int cy = ivec2(ubo.vertex_c).y;

    int top = min(min(ay, by), cy);
    int bottom = max(max(ay, by), cy);
    int left = min(min(ax, bx), cx);
    int right = max(max(ax, bx), cx);

    if (row < top || row > bottom || col < left || col > right) return;

    // rasterize
    bool in_triangle = BaryCentric(ivec2(col, row));
    if (in_triangle) {
        rasterize[row * ubo.width + col] = 1;
    }
}
```

We write white color(255) to the rasterized pixels and the rest remain black.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/barycentric/rasterized.png" title="rasterization" width="60%" height="60%">
</p>
