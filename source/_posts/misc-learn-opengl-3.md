---
title: Learn OpenGL 3
author: Joe Chu
date: 2023-11-15 14:39:36
tags: [opengl]
categories:
- misc
---

Draw a triangle.
- VBO: Vertex Buffer Object
- VAO: Vertex Array Object
- EBO: Element Buffer Object
- Shader

<!-- more -->

Github source code: [link](https://github.com/chuzcjoe/opengl/tree/master/3-triangle)
learning materials: [learnopengl](https://learnopengl.com/Getting-started/Hello-Triangle)

# Graphic Pipeline
The graphic pipeline is eseentially a process of transforming 3D coordinates to 2D pixels. This process can be further divided into two parts: 3D coordinates to 2D coordinates on screen and 2D coordinates to colored pixels. The figure below shows complete steps to convert vertex data to rendered pixels. Each step requires the output of the previous step as its input. All these steps are highly specialized and can be executed in parallel. Modern GPUs have many process cores (threads), which could process data quickly. To achieve parallelisim, each processing core runs small program. These small programs are called `shaders`.

- Vertex shader: transform 3D coordinates into different 3D coordinates.
- Geometry shader: form a primitive and has the ability to generate other shapes by emitting new vertices to form new (or other) primitive(s).
- Shape assembly: form one or more primitives and assembles all the point(s) in the primitive shape given.
- Rasterization: maps the resulting primitive(s) to the corresponding pixels on the final screen, resulting in fragments for the fragment shader to use.
- Fragment shader: calculate the final color of a pixel and this is usually the stage where all the advanced OpenGL effects occur.
- Test and blending: checks the corresponding depth (and stencil) value of the fragment and uses those to check if the resulting fragment is in front or behind other objects and should be discarded accordingly

In modern OpenGL, we need to implement our own `vertex shader` and `fragment shader` (no defualt on GPUs).

<p align="center">
    <img src="graphicpipeline.png" width="600px" hieght="500px">
</p>

# Coordinate
In OpenGL, a position contains (x, y, z) information. OpenGL only processes 3D coordinates within the range from [-1, 1], which are called `normalized device coordinates`. Anything else will be invisible on the screen.

<p align="center">
    <img src="coordinate.png" width="500px" hieght="300px">
</p>

# VBO
`Vertex buffer object` is used to store a large number of vertices in GPU memory. The purpose of VBO is that we can send large batches of data all at once to GPU, without having to send one vertex at a time.

```c++
unsigned int VBO;
glGenBuffers(1, &VBO); // create object behind the scene and return a reference ID
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
```

# VAO
`Vertex array object` can be bound to one/multiple VBOs. After the binding of VAO, any subsequent vertex attribute calls from that point on will be stored inside the VAO. Whenever we want to draw something, we just bind the VAO, which makes the switching between different vertex data and configuration much easier.

<p align="center">
    <img src="VAO.png" width="500px" hieght="500px">
</p>

```c++
unsigned int VAO;
glGenVertexArrays(1, &VAO); 
glBindVertexArray(VAO);
// after this point, the newly created VBO will be bound to VAO

glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
```

# EBO
`Element buffer object` stores indices that OpenGL uses to decide what vertices to draw. By doing that, we can address the problem where we have multiple triangles that have overlap vertexes. Let's take a look at one example.
```c++
float vertices[] = {
    // first triangle
     0.5f,  0.5f, 0.0f,  // top right
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f,  0.5f, 0.0f,  // top left 
    // second triangle
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f, -0.5f, 0.0f,  // bottom left
    -0.5f,  0.5f, 0.0f   // top left
}; 
```

However, duplicate vertexes are not necessary. We can further simplify it as:
```c++
float vertices[] = {
     0.5f,  0.5f, 0.0f,  // top right
     0.5f, -0.5f, 0.0f,  // bottom right
    -0.5f, -0.5f, 0.0f,  // bottom left
    -0.5f,  0.5f, 0.0f   // top left 
};
unsigned int indices[] = {  // note that we start from 0!
    0, 1, 3,   // first triangle
    1, 2, 3    // second triangle
}; 
```

Similar to `VBO`, `EBO` can be used as follows:
```c++
unsigned int EBO;
glGenBuffers(1, &EBO);

glBindVertexArray(VAO);
// after this point, VBO and EBO will be bound to VAO
glBindBuffer(GL_ARRAY_BUFFER, VBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

// vertex attributes
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);

// to draw
glBindVertexArray(VAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);
```

# Put everything together
The program draws two triangles side by side. One is green and another is blue. `F1` controls the draw mode.
```c++
#include <iostream>
#include <vector>
#include "include/glad.h"
#include <GLFW/glfw3.h>

GLenum line_type = GL_LINE;

const char *vertexShaderSource = "#version 330 core\n"
    "layout (location = 0) in vec3 aPos;\n"
    "void main()\n"
    "{\n"
    "   gl_Position = vec4(aPos.x, aPos.y, aPos.z, 1.0);\n"
    "}\0";

const char *fragmentShaderSource = "#version 330 core\n"
    "out vec4 FragColor;\n"
    "void main()\n"
    "{\n"
    "   FragColor = vec4(0.1f, 0.5f, 0.2f, 1.0f);\n"
    "}\n\0";


void handleInput(GLFWwindow* window) {
    if (glfwGetKey(window, GLFW_KEY_F1) == GLFW_PRESS) {
        std::cout << "F1 pressed\n";
        line_type = line_type == GL_LINE ? GL_FILL : GL_LINE;
        glPolygonMode(GL_FRONT_AND_BACK, line_type);
    }
}

int main() {
    glfwInit();
    glfwWindowHint(GLFW_CONTEXT_VERSION_MAJOR, 3);
    glfwWindowHint(GLFW_CONTEXT_VERSION_MINOR, 3);
    glfwWindowHint(GLFW_OPENGL_PROFILE, GLFW_OPENGL_CORE_PROFILE);

#ifdef __APPLE__
    glfwWindowHint(GLFW_OPENGL_FORWARD_COMPAT, GL_TRUE);
#endif

    // Create a window object
    GLFWwindow* window = glfwCreateWindow(800, 600, "Triangle", NULL, NULL);
    if (window == nullptr) {
        std::cout << "Failed to create GLFW window" << std::endl;
        glfwTerminate();
        return -1;
    }
    glfwMakeContextCurrent(window);

    // Initialize GLAD before we call any OpenGL functions
    // glad: load all OpenGL function pointers
    if (!gladLoadGLLoader((GLADloadproc)glfwGetProcAddress)) {
        std::cout << "Failed to initialize GLAD" << std::endl;
        return -1;
    }

    // Shader object
    unsigned int vertexShader;
    unsigned int fragmentShader;

    vertexShader = glCreateShader(GL_VERTEX_SHADER);
    fragmentShader = glCreateShader(GL_FRAGMENT_SHADER);

    glShaderSource(vertexShader, 1, &vertexShaderSource, nullptr);
    glCompileShader(vertexShader);

    glShaderSource(fragmentShader, 1, &fragmentShaderSource, nullptr);
    glCompileShader(fragmentShader);

    // check shader compilation
    int success;
    char infoLog[512];
    glGetShaderiv(vertexShader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(vertexShader, 512, nullptr, infoLog);
        std::cout << "ERROR::SHADER::VERTEX::COMPILATION_FAILED\n" << infoLog << std::endl;
    }

    glGetShaderiv(fragmentShader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(fragmentShader, 512, nullptr, infoLog);
        std::cout << "ERROR::SHADER::FRAGMENT::COMPILATION_FAILED\n" << infoLog << std::endl;
    }

    // create Shader program
    unsigned int shaderProgram;
    shaderProgram = glCreateProgram();

    // attach shaders to the program
    glAttachShader(shaderProgram, vertexShader);
    glAttachShader(shaderProgram, fragmentShader);
    glLinkProgram(shaderProgram);

    // check link status
    glGetProgramiv(shaderProgram, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(shaderProgram, 512, nullptr, infoLog);
        std::cout << "ERROR::SHADER::PROGRAM::COMPILATION_FAILED\n" << infoLog << std::endl;
    }

    // delete shader objs after linking
    glDeleteShader(vertexShader);
    glDeleteShader(fragmentShader);

    float vertices[] = {
        0.5f,  0.5f, 0.0f,  // top right
        0.5f, -0.5f, 0.0f,  // bottom right
        -0.5f, -0.5f, 0.0f,  // bottom left
        -0.5f,  0.5f, 0.0f   // top left 
    };

    unsigned int indices[] = {  // note that we start from 0!
        0, 1, 3,   // first triangle
        1, 2, 3    // second triangle
    };  

    // vertex buffer objects (VBO) that can store a large number of vertices in the GPU's memory
    // VAO is an object that encapsulates a set of vertex array states, including the configuration of vertex attributes and their associated data. 
    unsigned int VAO;
    unsigned int VBO;
    unsigned int EBO;

    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);
    glGenBuffers(1, &EBO);
    
    // bind VAO
    glBindVertexArray(VAO);

    // specify buffer type
    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
    // copy data
    // GL_STREAM_DRAW: the data is set only once and used by the GPU at most a few times.
    // GL_STATIC_DRAW: the data is set only once and used many times.
    // GL_DYNAMIC_DRAW: the data is changed a lot and used many times.
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
    // tell opengl how to interpret the vertex data
    glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(0);

    glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);

    while(!glfwWindowShouldClose(window)) {
        // handle user input
        handleInput(window);

        // render
        glClearColor(0.2f, 0.3f, 0.3f, 1.0f);
        glClear(GL_COLOR_BUFFER_BIT);

        // draw triangle
        glUseProgram(shaderProgram);
        glBindVertexArray(VAO);
        glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

        glfwSwapBuffers(window);
        glfwPollEvents();    
    }

    // de-allocate resources
    glDeleteVertexArrays(1, &VAO);
    glDeleteBuffers(1, &VBO);
    glDeleteProgram(shaderProgram);

    // glfw: terminate, clearing all previously allocated GLFW resources.
    glfwTerminate();
    return 0;
}
```

<p align="center">
    <img src="demo1.png" width="500px" hieght="500px">
</p>

<p align="center">
    <img src="demo2.png" width="500px" hieght="500px">
</p>

# References
- https://learnopengl.com/Getting-started/Hello-Triangle