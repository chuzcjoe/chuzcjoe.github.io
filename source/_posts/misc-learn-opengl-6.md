---
title: Learn OpenGL 6
author: Joe Chu
date: 2023-11-20 12:14:07
tags: [opengl]
categories:
- misc
---

Transformations

<!-- more -->

Github source code: [link](https://github.com/chuzcjoe/opengl/tree/master/6-transformation)
learning materials: [learnopengl](https://learnopengl.com/Getting-started/Transformations)

# Introduction

Transformations contain translation, scale, rotation or a combination of one or more of these. `One thing to note` is that when combing multiple matrices, the order should be read from `right-to-left`. If we want to do scale first then translation, It should look like this:

<p align="center">
    <img src="transform.png" width="600px" height="300px">
</p>


# GLM

GLM stands for OpenGL Mathematics and is a header-only library. It is an easy-to-use OpenGL math library. Download it from official [website](https://glm.g-truc.net/0.9.8/index.html), put `glm` folder under your project, include needed headers.

```c++
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
```

# Demo

Transformation matrices can be passed to vertex shader using `uniform` from host program.

**host**
```c++
// activate shader
shader.activate();

// transform matrix
glm::mat4 trans = glm::mat4(1.0f);
trans = glm::translate(trans, glm::vec3(-0.5f, 0.5f, 0.0f));
trans = glm::rotate(trans, (float)glfwGetTime(), glm::vec3(0.0f, 0.0f, 1.0f)); // axis needs to be unit
glUniformMatrix4fv(glGetUniformLocation(shader.getID(), "transform"), 1, GL_FALSE, glm::value_ptr(trans));
```

**vertex shader**
```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aTexture;

out vec3 ourColor;
out vec2 TexCoord;

uniform mat4 transform;

void main() {
   gl_Position = transform * vec4(aPos, 1.0);
   ourColor = aColor;
   TexCoord = aTexture;
}
```

<p align="center">
    <img src="transform.gif" width="600px" height="600px">
</p>

# References
- https://learnopengl.com/Getting-started/Transformations