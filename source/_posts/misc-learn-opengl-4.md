---
title: Learn OpenGL 4
author: Joe Chu
date: 2023-11-17 11:26:14
tags: [opengl]
categories:
- misc
---

Shader

<!-- more -->

Github source code: [link](https://github.com/chuzcjoe/opengl/tree/master/4-shaders)
learning materials: [learnopengl](https://learnopengl.com/Getting-started/Shaders)

# Introduction

Shaders are written in GLSL (OpenGL Shader Language). Shader programs reside on GPUs. The basic syntax looks like this:
```glsl
#version version_number
in type variable_name;
in type variable_name;

out type variable_name;
  
uniform type uniform_name;
  
void main()
{
  // process input(s) and do some weird graphics stuff
  ...
  // output processed stuff to output variable
  out_variable_name = weird_stuff_we_processed;
}
```

GLSL supported data type: `int`, `float`, `double`, `uint` and `bool`. It also supports its unique data type **vectors** and **matrices**.

For vectors, similar to what we have in OpenCL. It has multiple variants. You can use .x, .y, .z and .w to access their first, second, third and fourth component respectively.
- vecn: the default vector of n floats.
- bvecn: a vector of n booleans.
- ivecn: a vector of n integers.
- uvecn: a vector of n unsigned integers.
- dvecn: a vector of n double components.

# ins and outs

`in` and `out` keywords define the inputs and outputs of a shader program. In the below example, vertex shader receives inputs from vertex data and outputs `ourColor` to the next stage which is fragment shader. In fragment shader, it declares `ourColor` as input. This name has to be exactly the same as defined in vertex shader, otherwise, it will not work.

**vertex shader**
```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
out vec3 ourColor;
void main() {
   gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);
   ourColor = aColor;
}
```

**fragment shader**
```glsl
#version 330 core
out vec4 FragColor;
in vec3 ourColor;
uniform vec3 customColor;
void main() {
   FragColor = vec4(customColor, 1.0f);
}
```

As you probably noticed that in vertex shader, we have `layout (location = 0)` and `layout (location = 1)`. What do they mean? Let's take a look at our host program.

This should be pretty self-explanatory. When we pass vertex data to vertex shader, we not only pass vertex data but also color information. So, we have two vertex attributes right now and we need to setup vertex attribute pointers for these two to let OpenGL know how to read the data.

```c++
float vertices[] = {
        // positions         // colors
        0.5f, -0.5f, 0.0f,  1.0f, 0.0f, 0.0f,   // bottom right
        -0.5f, -0.5f, 0.0f,  0.0f, 1.0f, 0.0f,   // bottom left
        0.0f,  0.5f, 0.0f,  0.0f, 0.0f, 1.0f    // top 
    };

// position attribute
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
// color attribute
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 6 * sizeof(float), (void*)(3 * sizeof(float)));
glEnableVertexAttribArray(1);
```

<p align="center">
    <img src="vertexattributeptr.png" width="600px" height="300px">
</p>

# uniform variables
Uniform is another way to pass data from CPU to GPU. Uniform variables are global, meaning they can be accessed from other shader programs. A simple example below shows we have a uniform variable `ourColor` defined in the vertex shader. It determines the color of output pixels. In our host program, we explicitly set `ourColor` to be a changing value subject to time.

```glsl
#version 330 core
out vec4 FragColor;
  
uniform vec4 ourColor; // we set this variable in the OpenGL code.

void main()
{
    FragColor = ourColor;
} 
```

```c++
float timeValue = glfwGetTime();
float greenValue = (sin(timeValue) / 2.0f) + 0.5f;
int vertexColorLocation = glGetUniformLocation(shaderProgram, "ourColor");
glUseProgram(shaderProgram);
glUniform4f(vertexColorLocation, 0.0f, greenValue, 0.0f, 1.0f);
```

# Abstract Shader

In the previous tutorial, if we want to have two shader programs, we need to repeat everything twice which is not efficient. That's why it is necessary to have a `Shader` class to handle this,

```c++
    // Shader object
    unsigned int vertexShader;
    unsigned int fragmentShader[2];

    vertexShader = glCreateShader(GL_VERTEX_SHADER);
    fragmentShader[0] = glCreateShader(GL_FRAGMENT_SHADER);
    fragmentShader[1] = glCreateShader(GL_FRAGMENT_SHADER);

    glShaderSource(vertexShader, 1, &vertexShaderSource, nullptr);
    glCompileShader(vertexShader);

    // first fragment shader
    glShaderSource(fragmentShader[0], 1, &fragmentShaderSource1, nullptr);
    glCompileShader(fragmentShader[0]);

    // second fragment shader
    glShaderSource(fragmentShader[1], 1, &fragmentShaderSource2, nullptr);
    glCompileShader(fragmentShader[1]);

    // create two Shader programs
    unsigned int shaderProgram[2];
    shaderProgram[0] = glCreateProgram();
    shaderProgram[1] = glCreateProgram();

    // attach shaders to the first program
    glAttachShader(shaderProgram[0], vertexShader);
    glAttachShader(shaderProgram[0], fragmentShader[0]);
    glLinkProgram(shaderProgram[0]);

    // attach shaders to the second program
    glAttachShader(shaderProgram[1], vertexShader);
    glAttachShader(shaderProgram[1], fragmentShader[1]);
    glLinkProgram(shaderProgram[1]);

    // delete shader objs after linking
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader[0]);
    glDeleteShader(fragmentShader[1]);
```

Our strategy is to have `Shader.h` and `Shader.cpp` for keeping everything related to shader program. We also have two standalone `shader.vs` and `shader.fs` files for writing shaders. For more details, check my [code](https://github.com/chuzcjoe/opengl/tree/master/4-shaders)

**Shader.h**
```c++
#ifndef SHADER_H
#define SHADER_H

#include "include/glad.h"

#include <string>
#include <fstream>
#include <sstream>
#include <iostream>
#include <vector>

class Shader {
private:
    unsigned int m_id;
public:
    Shader(const char* vertexPath, const char* fragmentPath);

    // use shader program
    void activate();

    void updateColor(const char* name,  std::vector<float>& color);

    // check compile error
    void checkCompileErrors(unsigned int shader, std::string type);
};

#endif
```

Here is the final result.

<p align="center">
    <img src="shader.gif" width="800px" height="800px">
</p>


# References
- https://learnopengl.com/Getting-started/Shaders