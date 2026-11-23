---
title: Setting up Vulkan on MacOS
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
date: 2025-03-11 20:36:03
tags: [vulkan]
categories:
- CGV
---

Setting up Vulkan development environment on MacOS using Xcode.

<!-- more -->

1. Download the latest SDK from [the LunarG website](https://vulkan.lunarg.com/sdk/home#mac)

2. Extract the downloaded file and install SDK. Remember your installed path.

3. Install GLFW
```
brew install glfw
```

4. Install GLM
```
brew install glm
```

5. Configure Xcode

Start a new project and choose **Command Line Tool**. For the language, select **C++**. Add the following code example to `main.cpp`.
```cpp main.cpp
#define GLFW_INCLUDE_VULKAN
#include <GLFW/glfw3.h>

#define GLM_FORCE_RADIANS
#define GLM_FORCE_DEPTH_ZERO_TO_ONE
#include <glm/vec4.hpp>
#include <glm/mat4x4.hpp>

#include <iostream>

int main() {
    glfwInit();

    glfwWindowHint(GLFW_CLIENT_API, GLFW_NO_API);
    GLFWwindow* window = glfwCreateWindow(800, 600, "Vulkan window", nullptr, nullptr);

    uint32_t extensionCount = 0;
    vkEnumerateInstanceExtensionProperties(nullptr, &extensionCount, nullptr);

    std::cout << extensionCount << " extensions supported\n";

    glm::mat4 matrix;
    glm::vec4 vec;
    auto test = matrix * vec;

    while(!glfwWindowShouldClose(window)) {
        glfwPollEvents();
    }

    glfwDestroyWindow(window);

    glfwTerminate();

    return 0;
}
```

You will see a lot of error messages at the beginning. We need to configure the project. Select the project and go to **Build Settings**. Find **Header Search Paths** and **Library Search Paths**.

1. For **Header Search Paths**, add links: `/usr/local/include [your_vk_location]/macOS/include`
1. For **Library Search Paths**, add links: `/usr/local/lib [your_vk_location]/macOS/lib`

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/vulkan-macos/0.png" title="Image 1" width="700px" height="600px">
</p>

Then go to **Build Phases** tab and add `glfw3` and `vulkan` dynamic libraries.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/vulkan-macos/1.png" title="Image 1" width="700px" height="600px">
</p>

After adding these libraries, in the same tab, open **Copy Files**, change **Destination** to "Frameworks", clear the subpath and uncheck "Copy only when installing". Click "+" and add all the three libraries here.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/vulkan-macos/2.png" title="Image 1" width="700px" height="600px">
</p>

6. Run demo

Run the project and you should see a Vulkan window displaying on your screen.

# Reference
- https://vulkan-tutorial.com/Development_environment#page_MacOS
