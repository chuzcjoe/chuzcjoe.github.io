---
title: Learn OpenGL 7
author: Joe Chu
date: 2023-11-21 10:58:32
tags: [opengl]
categories:
- misc
---

Coordinate Systems

<!-- more -->

# Introduction

OpenGL expects all the vertices to be normalized in order to be seen on the screen. Transforming coordinates to `normal device coordinates` requires several different transformations. Each transformation corresponds to a certain coordinate system. There are five different coordinate systems.

- local space
- world space
- view space
- clip space
- screen space

<p align="center">
    <img src="coordinatesystems.png" width="800px" height="300px">
</p>

**local space**
Local space is the coordinate space that is local to your object. All the transformations (translation, rotation and scale) mentioned in the previous tutorial apply to local space with `model matrix`.

**world space**
World space is where all the objects are located. The model matrix translates, scales and/or rotates your object to place it in the world at a location/orientation they belong to. A realistic example is: Think of it as transforming a house by scaling it down (it was a bit too large in local space), translating it to a suburbia town and rotating it a bit to the left on the y-axis so that it neatly fits with the neighboring houses.

**view space**
The view space is the result of transforming your world-space coordinates to coordinates that are in front of the user's view. The view space is thus the space as seen from the camera's point of view.

**clip space**
In clip space, coordinates that are outside of the specific range will be clipped. There are two types of projections: orthographic projection and perspective projection.

Orthographic projection defines a cube-like frustum box. All the coordinates inside this frustum will be visible and within the range of NDC.

In GLM, it defines as:

```c++
// left  right   bottom top    near  far
glm::ortho(0.0f, 800.0f, 0.0f, 600.0f, 0.1f, 100.0f);
```

<p align="center">
    <img src="orthographicfrustum.png" width="300px" height="300px">
</p>

The problem of orthographic projection is that it does not mimic the real world scenario. In real life, objects that are farther away appear much smaller.

`Homogeneous coordinates` plays an important role in perspective projection. The projection matrix maps a given frustum range to clip space, but also manipulates the w value of each vertex coordinate in such a way that the further away a vertex coordinate is from the viewer, the higher this w component becomes.

<p align="center">
    <img src="perspectivefrustum.png" width="300px" height="300px">
</p>

Each component of the vertex coordinate is divided by its w component giving smaller vertex coordinates the further away a vertex is from the viewer.

<p align="center">
    <img src="hg.png" width="300px" height="300px">
</p>

In GLM, it defines as:

```c++
// FOV aspect-ratio near far
glm::mat4 proj = glm::perspective(glm::radians(45.0f), (float)width/(float)height, 0.1f, 100.0f);
```

# Put all together

<p align="center">
{% katex %}
V_{clip} = M_{projection} \cdot M_{view} \cdot M_{model} \cdot V_{local}
{% endkatex %}
</p>

**vertex shader**
```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec2 aTexture;

out vec3 ourColor;
out vec2 TexCoord;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main() {
   gl_Position = projection * view * model * vec4(aPos, 1.0);
   TexCoord = aTexture;
}
```

**host program**
```c++
// activate shader
shader.activate();

// transform matrix
glm::mat4 view = glm::mat4(1.0f);
glm::mat4 projection = glm::mat4(1.0f);
view = glm::translate(view, glm::vec3(0.0f, 0.0f, -3.0f));
projection = glm::perspective(glm::radians(45.0f), ((float)(screenWidth)) /((float)(screenHeight)), 0.1f, 100.0f);
glUniformMatrix4fv(glGetUniformLocation(shader.getID(), "view"), 1, GL_FALSE, glm::value_ptr(view));
glUniformMatrix4fv(glGetUniformLocation(shader.getID(), "projection"), 1, GL_FALSE, glm::value_ptr(projection));

// draw
glBindVertexArray(VAO);
for (int i = 0; i < 10; i++) {
    glm::mat4 model = glm::mat4(1.0f);
    model = glm::translate(model, cubePositions[i]);
    if (i % 3 || i == 0)
        model = glm::rotate(model, (float)glfwGetTime(), glm::vec3(0.5f, 1.0f, 0.0f));
    glUniformMatrix4fv(glGetUniformLocation(shader.getID(), "model"), 1, GL_FALSE, glm::value_ptr(model));
    glDrawArrays(GL_TRIANGLES, 0, 36);
}
```

# Z-buffer

OpenGL stores all its depth information in a z-buffer. Whenever the fragment wants to output its color, OpenGL compares its depth values with the z-buffer. If the current fragment is behind the other fragment it is discarded, otherwise overwritten. This process is called `depth testing`.

To enable depth testing:

```c++
glEnable(GL_DEPTH_TEST);
```

Make sure to clear depth buffer at the beginning of each rendering loop.

```c++
glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
```

# Demo

<p align="center">
    <img src="demo.gif" width="500px" height="500px">
</p>

# References
- https://learnopengl.com/Getting-started/Coordinate-Systems
- https://yihui.org/en/2018/07/latex-math-markdown/