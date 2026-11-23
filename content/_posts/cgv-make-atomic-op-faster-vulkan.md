---
title: Make atomicAdd Faster in Vulkan
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
date: 2025-08-21 21:19:24
tags: [atomic, vulkan]
categories:
- CGV
---

Global counter, shared counter and subgroup optimization.

<!-- more -->

`atomic` ensures only one GPU thread can write to the memory, preventing others from writing at the same time. If many threads hit at once, a single global atomic can become a hotspot, often introducing performance bottleneck.

# 1. Global Counter

Global counter is visible to all workgroups. Thread contention will happen and cause performance degradation.

```glsl
#version 450
layout(local_size_x = 128) in;

// SSBO with a single 32-bit counter
layout(std430, binding = 0) buffer CounterBuf {
    uint counter;
};

void main() {
    bool hit = /* your condition from the computed value */;

    if (hit) {
        // Atomically add 1
        atomicAdd(counter, 1u);
    }
}
```

# 2. Shared Counter

Count within the workgroup using shared memory, then do one atomic to the global counter.

```glsl
#version 450
layout(local_size_x = 128) in;

layout(std430, binding = 0) buffer CounterBuf {
    uint globalCounter;
};

shared uint wgCounter;

void main() {
    // One lane initializes the shared counter
    if (gl_LocalInvocationIndex == 0u) wgCounter = 0u;
    barrier(); // synchronize shared memory initialization

    bool hit = /* your condition */;
    if (hit) {
        atomicAdd(wgCounter, 1u);  // fast, within workgroup
    }

    barrier(); // ensure all increments are done

    // One lane publishes to global
    if (gl_LocalInvocationIndex == 0u) {
        atomicAdd(globalCounter, wgCounter);
    }
}
```

# 3. Subgroup Optimization

We can go further and do one atomic per subgroup. Threads in a workgroup are not executed individually, in fact, they are executed as batches and each batch is what we call subgroup. It often refers to a warp (NVIDIA) or wavefront/wave (AMD).

Typical sizes: 32 (NVIDIA), 64 (AMD), 8/16/32 (Intel/ARM). It’s hardware-dependent and can vary by devices.

`subgroupAdd()` reduces the per-lane values within the subgroup.
`subgroupElect()` is true for exactly one lane in the subgroup.

To enable this feature, you need Vulkan 1.1+, and compile your shaders like this:
```
glslc --target-env=vulkan1.1 -mfmt=c shader.comp -o shader.spv

```

```glsl
#version 450
#extension GL_KHR_shader_subgroup_arithmetic : require
layout(local_size_x = 128) in;

layout(std430, binding = 0) buffer CounterBuf { uint globalCounter; };

void main() {
    bool hit = /* your condition */;
    uint subgroupSum = subgroupAdd(hit ? 1u : 0u);
    if (subgroupElect()) {                // exactly one lane per subgroup
        atomicAdd(globalCounter, subgroupSum);
    }
}
```

More resources: https://www.khronos.org/blog/vulkan-subgroup-tutorial