---
title: Vulkan Pipeline Cache
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
date: 2026-04-11 21:37:42
tags: [vulkan]
categories:
- CGV
---

Leverage Vulkan pipeline cache to reduce pipeline initialization latency.

<!-- more -->

# 1. Introduction

Creating a Vulkan pipleine(render pipeline/compute pipeline) is expensive because it involves:
- Shader compilation.
- Pipeline state initialization, especially for rendering pipeline which includes vertex/fragment processing, tessellation, rasterization, etc.
- Hardware-specific tuning (register allocation, scheduling, etc.)

In a normal Vulkan compute pipeline creation, `Create Pipeline` takes the most of the initialization time.
<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/vulkan_pipeline_cache/vulkan_pipeline_cache1.png" title="Image 1" width="700px" height="600px">
</p>

What Vulkan pipeline cache does is to save the pipeline state to a file so that it can be reused between runs of an application.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/vulkan_pipeline_cache/vulkan_pipeline_cache2.png" title="Image 1" width="800px" height="600px">
</p>

# 2. APIs

To create a pipeline cahce object:
```cpp
VKAPI_ATTR VkResult VKAPI_CALL vkCreatePipelineCache(
    VkDevice                                    device,
    const VkPipelineCacheCreateInfo*            pCreateInfo,
    const VkAllocationCallbacks*                pAllocator,
    VkPipelineCache*                            pPipelineCache);
```

We need to populate the `VkPipelineCacheCreateInfo` to create a cached object:
```cpp
typedef struct VkPipelineCacheCreateInfo {
    VkStructureType               sType;
    const void*                   pNext;
    VkPipelineCacheCreateFlags    flags;
    size_t                        initialDataSize;
    const void*                   pInitialData;
} VkPipelineCacheCreateInfo;
```

`vkCreateComputePipelines` allows us to pass a `VkPipelineCache` object:
```cpp
VKAPI_ATTR VkResult VKAPI_CALL vkCreateComputePipelines(
    VkDevice                                    device,
    VkPipelineCache                             pipelineCache,
    uint32_t                                    createInfoCount,
    const VkComputePipelineCreateInfo*          pCreateInfos,
    const VkAllocationCallbacks*                pAllocator,
    VkPipeline*                                 pPipelines);
```

To read and save pipeline cache as binary data, we need `vkGetPipelineCacheData`:
```cpp
VKAPI_ATTR VkResult VKAPI_CALL vkGetPipelineCacheData(
    VkDevice                                    device,
    VkPipelineCache                             pipelineCache,
    size_t*                                     pDataSize,
    void*                                       pData);
```

# 3. Implementation

Detailed implementation of pipeline cache can be found at: https://github.com/chuzcjoe/CORE/blob/master/vulkan/tests/ComputeGaussianBlurTest.cpp

From my local testing (Mac with M2), for a gaussian blur compute pipeline creation, the latency can be optimized from 10.2ms to 1.2ms. **That's 90% optimization**.

# 4. Pipeline Cache may not working

There are several real-world scenarios where a Vulkan pipeline cache will not be effective, even if you correctly save and reload it. The key principle is: Pipeline cache is driver and environment dependent, and only works when the exact compilation context matches.

For example, in the following cases, pipeline cache will not help with the latency improvement:

1. Different GPUs.
2. GPU driver versions mismached.
3. Different GPU vendors (Nvidia, Qualcomm, AMD, etc).
4. Any changes in pipeline states(shaders, descriptors, render pass, rasterization state, etc).
5. And more.

Vulkan enforces strict constraints for pipeline cache effectiveness. Even on the same device, a saved pipeline cache may become invalid due to changes in the device context. Vulkan validates this by checking the following properties:

```cpp
typedef struct VkPhysicalDeviceProperties {
    uint32_t                            apiVersion;
    uint32_t                            driverVersion;
    uint32_t                            vendorID;
    uint32_t                            deviceID;
    VkPhysicalDeviceType                deviceType;
    char                                deviceName[VK_MAX_PHYSICAL_DEVICE_NAME_SIZE];
    uint8_t                             pipelineCacheUUID[VK_UUID_SIZE];
    VkPhysicalDeviceLimits              limits;
    VkPhysicalDeviceSparseProperties    sparseProperties;
} VkPhysicalDeviceProperties;
```

If Vulkan detects any mismatch between the current state and the cached metadata, the pipeline cache will not function as intended.