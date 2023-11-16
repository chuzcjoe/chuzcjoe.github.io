---
title: Learn OpenGL 1
author: Joe Chu
date: 2023-11-14 15:26:17
tags: [opengl]
categories:
- misc
---

Setting up OpenGL in Ubuntu (GLFW, GLAD)

<!-- more -->

github source code: [link](https://github.com/chuzcjoe/opengl/tree/master/1-start)
learning materials: [learnopengl.com](https://learnopengl.com/Introduction)

# Introduction

This tutorial shows how to setup a basic opengl project on ubuntu 22.04. Other platforms such as Mac and Windows are not covered. There should be plenty of resources online that you can refer to.

# GLFW and GLAD

**GLFW** is a library, written in C, specifically targeted at OpenGL. GLFW gives us the bare necessities required for rendering goodies to the screen. It allows us to create an OpenGL context, define window parameters, and handle user input, which is plenty enough for our purposes.

Install GLFW:
```
sudo apt-get install libglfw3-dev
```

**GLAD** is a tool used for generating a loader for OpenGL function pointers. It simplifies the process of setting up OpenGL in a program by automatically generating the code necessary to load OpenGL functions at runtime.

**GLAD** has a .c file and a .h file. You can directly put these two files under your project. To access glad files, refer to my github project.

# Create a window

```c++
#include <iostream>
#include "include/glad.h"
#include <GLFW/glfw3.h>

int main() {
    std::cout << "OpenGL\n";

    GLFWwindow* window;

    if (!glfwInit()) return -1;

    window = glfwCreateWindow(640, 500, "window", nullptr, nullptr);
    glfwMakeContextCurrent(window);

    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cout << "Couldn't load opengl\n";
        glfwTerminate();
        return -1;
    }

    glClearColor(0.25f, 0.5f, 0.75f, 1.0f);

    while (!glfwWindowShouldClose(window)) {
        glfwPollEvents();
        glClear(GL_COLOR_BUFFER_BIT);
        glfwSwapBuffers(window);
    }

    glfwTerminate();
}
```

run `build.sh`, if everything is correct. You should see a blue window.
<p align="center">
    <img src="openglwindow.png" width="500px" height="500px">
</p>

# References
- https://learnopengl.com/Getting-started/Creating-a-window
- https://www.youtube.com/watch?v=LxEFn-cGdE0