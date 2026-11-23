---
title: Missing vkCmdBeginRendering and vkCmdEndRendering on MacOS
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
date: 2025-12-30 22:45:10
tags: [vulkan, dynamic rendering]
categories:
- CGV
---

APIs for dynamic rendering in Vulkan.

<!-- more -->

Recently, I was refactoring some Vulkan rendering code to adopt dynamic rendering, which has been promoted to core Vulkan by the official tutorial (https://docs.vulkan.org/tutorial/latest/03_Drawing_a_triangle/03_Drawing/00_Framebuffers.html).

I successfully updated most of the rendering pipeline and resolved all validation errors reported by the Vulkan validation layers. However, the application consistently crashed with a segmentation fault at runtime. After spending a significant amount of time debugging, I traced the issue back to the following code:

```cpp
vkCmdBeginRendering(command_buffer.buffer(), &rendering_info);
// Some rendering work
// ...
vkCmdEndRendering(command_buffer.buffer());
```

The program compiled without any issues because the Vulkan loader was able to resolve the symbols `vkCmdBeginRendering` and `vkCmdEndRendering` at link time. However, these calls were invalid at runtime. The logical device could not dispatch the commands to the driver, which ultimately caused the crash.

This behavior occurs because macOS does not provide a native Vulkan loader or driver. Instead, all Vulkan calls are routed through MoltenVK and a non-native loader. Unlike native Vulkan implementations on Windows and Linux, MoltenVK strictly enforces Vulkan’s runtime dispatch rules and does not export many core dispatcher functions by default.

As a result, the correct solution is to explicitly load the dynamic rendering function pointers using `vkGetDeviceProcAddr`:

```cpp
vkCmdBeginRendering = reinterpret_cast<PFN_vkCmdBeginRendering>(
      vkGetDeviceProcAddr(device, "vkCmdBeginRenderingKHR"));

vkCmdEndRendering =
      reinterpret_cast<PFN_vkCmdEndRendering>(vkGetDeviceProcAddr(device, "vkCmdEndRenderingKHR"));
```

I initially attempted to load the non-KHR entry points instead, but this still resulted in a segmentation fault:

```cpp
vkCmdBeginRendering = reinterpret_cast<PFN_vkCmdBeginRendering>(
      vkGetDeviceProcAddr(device, "vkCmdBeginRendering"));

vkCmdEndRendering =
      reinterpret_cast<PFN_vkCmdEndRendering>(vkGetDeviceProcAddr(device, "vkCmdEndRendering"));
```

Based on this behavior, it appears that on macOS (MoltenVK), the KHR variants should be preferred, with a fallback to the core entry points only if necessary. A robust loading strategy therefore looks like this:

```cpp
VulkanRenderingCommands LoadDynamicRenderingCommands(VkDevice device) {
  VulkanRenderingCommands cmds{};

  cmds.vkCmdBeginRendering = reinterpret_cast<PFN_vkCmdBeginRendering>(
      vkGetDeviceProcAddr(device, "vkCmdBeginRenderingKHR"));
  if (!cmds.vkCmdBeginRendering) {
    cmds.vkCmdBeginRendering = reinterpret_cast<PFN_vkCmdBeginRendering>(
        vkGetDeviceProcAddr(device, "vkCmdBeginRendering"));
  }

  cmds.vkCmdEndRendering =
      reinterpret_cast<PFN_vkCmdEndRendering>(vkGetDeviceProcAddr(device, "vkCmdEndRenderingKHR"));
  if (!cmds.vkCmdEndRendering) {
    cmds.vkCmdEndRendering =
        reinterpret_cast<PFN_vkCmdEndRendering>(vkGetDeviceProcAddr(device, "vkCmdEndRendering"));
  }

  return cmds;
}
```

This approach ensures correct behavior across platforms, while remaining compliant with Vulkan’s runtime dispatch model—particularly on macOS, where direct calls to promoted core commands may not be safely callable.