---
title: Common Techniques for Defining Shader Code
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
date: 2025-03-20 23:39:17
tags: [shader]
categories:
- CGV
---

Introducing three common techniques.

<!-- more -->

# 1. Using Variadic Macros

```cpp
#define VERTEX_SHADER(...) "#version 300 es\n" #__VA_ARGS__
#define FRAGMENT_SHADER(...) "#version 300 es\n" #__VA_ARGS__

// Triangle Shader
const char* TriangleVertexShader = VERTEX_SHADER(
       layout(location = 0) in vec4 vPosition;
       void main() {
           gl_Position = vPosition;
       }
);

const char* TriangleFragmentShader = FRAGMENT_SHADER(
     precision mediump float;
     out vec4 FragColor;
     void main() {
         FragColor = vec4(0.0, 1.0, 0.0, 1.0);
     }
);
```

# 2. Using Raw String Literal

```cpp
const char* vertexShaderSource = R"(
    #version 330 core
    layout(location = 0) in vec3 aPos;
    void main() {
        gl_Position = vec4(aPos, 1.0);
    }
)";
```

# 3. Shader Files

```glsl vertexShader.glsl
#version 330 core
layout(location = 0) in vec3 aPos;
void main() {
    gl_Position = vec4(aPos, 1.0);
}
```

Read file in C++:
```cpp
std::ifstream file("vertexShader.glsl");
std::stringstream buffer;
buffer << file.rdbuf();
std::string vertexShaderSource = buffer.str();
```

