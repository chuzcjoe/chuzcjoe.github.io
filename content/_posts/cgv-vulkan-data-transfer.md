---
title: Data Transfer in Vulkan
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
date: 2025-08-10 15:19:41
tags: [vulkan]
categories:
- CGV
---

In this post, we will discuss how data is transferred between hosts and devices.

<!-- more -->

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/vulkan-vis/7-datatransfer1.png" title="Image 1" width="800px" height="700px">
</p>

<!-- In Vulkan, there are two types of resources: `VkBuffer` and `VkImage`. Each resource has a `VkDeviceMemory` associated with it. The way they are bound is through `vkBindBufferMemory` or `vkBindImageMemory`. 

In order to upload/transfer data to GPU memory for compute/execution, we need an intermediate data layer, which we call `staging buffer`. `Staging buffer` is not a special type of hardware buffer, it is just a `VkBuffer` you create with memory properties that make it **Host(CPU) Visible**, so we can upload/read data from the host. Vulkan provides a way for us to write data to `VkBuffer`. `vkMapMemory` allows us to read/write a range of `VkDeviceMemory` via a pointer. We could simply use `memcpy()` to write to the memory.

As the figure shows above, `staging buffers` are normally residing in system RAMs on discrete GPUs, whereas on integrated GPUs, the same physical RAMs are visible to both CPUs and GPUs. For `staging buffer` to be visible to Host, we must set the memory properties to be `VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT| VK_MEMORY_PROPERTY_HOST_COHERENT_BIT`. The second flag is optional and it ensures that hosts and devices can see the updated data without explicitly calling `vkFlushMappedMemoryRanges` or `vkInvalidateMappedMemoryRanges`.

Once we write the data to `staging buffers`, we can further transfer them to GPU memories. The most common Vulkan commands we use are: `vkCmdCopyBuffer` and `vkCmdCopyBufferToImage`. One thing to note is that we should set the memory property to be `VK_MEMORY_DEVICE_LOCAL_BIT` for `VkDeviceMemory` allocated on the device side.

To access the compute/render results from the GPU, we can use `vkCmdCopyImageToBuffer` to copy the data from GPU memory(as `VkImage`) to staging buffer, which is visible to CPU. So we can easily read back the data in C++. Of course `vkCmdCopyBuffer` can copy data between `staging buffer` and buffers in GPU, as long as they are both in `VkBuffer` type. -->


In Vulkan, there are two main types of resources: `VkBuffer` and `VkImage`. Each resource has a `VkDeviceMemory` associated with it, which is bound using either `vkBindBufferMemory` or `vkBindImageMemory`.`

To upload or transfer data to GPU memory for compute or rendering, we typically use an intermediate data layer called a `staging buffer`. A staging buffer is not a special hardware type; it’s simply a `VkBuffer` created with memory properties that make it Host (CPU) Visible, allowing us to upload or read data from the host. Vulkan provides a way to write to a `VkBuffer` through `vkMapMemory`, which lets us access a specified range of VkDeviceMemory via a pointer. Once mapped, we can use `memcpy()` to write data directly.

As illustrated above, staging buffers usually reside in system RAM for discrete GPUs, whereas on integrated GPUs, the same physical RAM is shared between the CPU and GPU. For a staging buffer to be host-visible, its memory must be allocated with `VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT`. The second flag is optional but ensures that the host and device see updated data without explicitly calling `vkFlushMappedMemoryRanges` or `vkInvalidateMappedMemoryRanges`.

After writing data to a staging buffer, we can transfer it to GPU memory. The most common Vulkan commands for this are `vkCmdCopyBuffer` and `vkCmdCopyBufferToImage`. For `VkDeviceMemory` allocated on the device side, the recommended property is `VK_MEMORY_PROPERTY_DEVICE_LOCAL_BIT`.

To retrieve compute or rendering results from the GPU, we can use `vkCmdCopyImageToBuffer` to copy data from a GPU `VkImage` into a staging buffer that is CPU-visible, making it easy to read the results in C++. Likewise, `vkCmdCopyBuffer` can be used to copy data between a staging buffer and a GPU buffer, as long as both are of type `VkBuffer`.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/vulkan-vis/7-datatransfer2.png" title="Image 1" width="800px" height="700px">
</p>

There is one special case. Data doesn't have to be in GPU memory for shader programs to fetch the resources. For example, as the figure shown above, staging buffer can also be used directly as descriptor sets for shaders to use. In other words, we can bind a host-visible “staging” buffer directly to shaders as a uniform/storage/vertex/index buffer.

Vulkan lets shaders read from any buffer as long as: the buffer was created with the right usage flags (`UNIFORM_BUFFER_BIT`, `STORAGE_BUFFER_BIT`, `VERTEX_BUFFER_BIT`, etc.).

GPU can access host-visible memory via PCIe. Ideally, it is not a good idea to directly bind staging buffer for shaders to use, though it should be fine for small amount of data(like UBO).

---

More Vulkan visualizations: https://chuzcjoe.github.io/CGV/cgv-vulkan-visualization/