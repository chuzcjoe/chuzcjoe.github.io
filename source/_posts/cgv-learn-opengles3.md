---
title: Learn OpenGLES 3
author: Joe Chu
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: /img/me.jpeg
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
    index: true
    collapsed: true
    depth: 3
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
  - position: left
    type: categories
date: 2024-07-26 21:42:28
tags: [opengles]
categories:
- CGV
---

VAO, VBO and EBO

<!-- more -->

Source code: https://github.com/chuzcjoe/learnopengles

# 1. Vertex Buffer Object (VBO)

In our first demo, where we render a triangle in the center of the screen, we define the vertices and store them on the CPU. When `glDrawArrays` is called, this data is transferred from the CPU to the GPU for rendering. While this method works well for small data sizes, it can become a performance bottleneck if large amounts of data need to be loaded from the CPU to the GPU. `VBO` is designed to address such issue. `VBO` manages large batches of data on GPU memory and keep it there if enough space left on GPU. Once the data is in GPU memory, shader programs can have instant access to it.

```c++
GLfloat vertices[4 * (3 + 4)] = {
        // Vertex positions followed by color attributes
        -0.5f,  0.5f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, // v0, c0
        -0.5f, -0.5f, 0.0f, 0.0f, 1.0f, 0.0f, 1.0f, // v1, c1
        0.5f, -0.5f, 0.0f, 0.0f, 0.0f, 1.0f, 1.0f,  // v2, c2
        0.5f,  0.5f, 0.0f, 0.5f, 1.0f, 1.0f, 1.0f   // v3, c3
};

// Generate VBO and load data
glGenBuffers(1, &mVBO);
glBindBuffer(GL_ARRAY_BUFFER, mVBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
```

# 2. Vertex Array Object (VAO)

A Vertex Array Object (VAO) in OpenGL is a container object that encapsulates the state needed to specify vertex data to the GPU. It essentially keeps track of multiple vertex buffer objects (VBOs) and their associated vertex attribute configurations, allowing you to easily switch between different vertex data sets and attribute setups.

After a VAO is bound, any subsequent vertex attribute calls will be stored in VAO.

```c++
// Generate VAO and define how data is stored
glGenVertexArrays(1, &mVAO);
glBindVertexArray(mVAO);

// Generate VBO, EBO and bind them for VAO to capture
// ...

// Specify the layout of the vertex data
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 7 * sizeof(float), (void*)(0));
glEnableVertexAttribArray(0);

glVertexAttribPointer(1, 4, GL_FLOAT, GL_FALSE, 7 * sizeof(float), (void*)(3 * sizeof(float)));
glEnableVertexAttribArray(1);

// Unbind the VAO (it's a good practice to unbind any VAO to prevent accidental modification)
glBindVertexArray(GL_NONE);
```

# 3. Element Buffer Object (EBO)

Element Buffer Objects (EBOs), also known as Index Buffer Objects (IBOs), are an essential feature in OpenGL used for indexing vertex data. They allow you to specify indices that define the order in which vertices are processed, making it possible to reuse vertex data to draw multiple primitives (such as triangles, lines, etc.), which can significantly reduce the amount of memory required and improve performance.

```c++
// without EBO
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

// with EBO
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

To use EBO:
```c++
GLfloat vertices[4 * (3 + 4)] = {
        // Vertex positions followed by color attributes
        -0.5f,  0.5f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, // v0, c0
        -0.5f, -0.5f, 0.0f, 0.0f, 1.0f, 0.0f, 1.0f, // v1, c1
        0.5f, -0.5f, 0.0f, 0.0f, 0.0f, 1.0f, 1.0f,  // v2, c2
        0.5f,  0.5f, 0.0f, 0.5f, 1.0f, 1.0f, 1.0f   // v3, c3
};

GLushort indices[6] = {0, 1, 2, 0, 2, 3};

// Generate EBO and load data
glGenBuffers(1, &mEBO);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mEBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, (void*)(0));
```

# 4. Shaders

The vertex shader takes two inputs because we defined two attribute pointers in VAO with location 0(position) and 1(color).

```c++
// VAO VBO Shader
const char* VAOVBOVertexShader = VERTEX_SHADER(
      layout(location = 0) in vec3 aPosition;
      layout(location = 1) in vec4 aColor;
      out vec4 vColor;
      void main() {
          gl_Position = vec4(aPosition, 1.0);
          vColor = aColor;
      }
);

const char* VAOVBOFragmentShader = FRAGMENT_SHADER(
        precision mediump float;
        in vec4 vColor;
        out vec4 FragColor;
        void main() {
            FragColor = vColor;
        }
);
```

# 5. Demo

Complete code to setup VAO, VBO and EBO.
```cpp
GLfloat vertices[4 * (3 + 4)] = {
        // Vertex positions followed by color attributes
        -0.5f,  0.5f, 0.0f, 1.0f, 0.0f, 0.0f, 1.0f, // v0, c0
        -0.5f, -0.5f, 0.0f, 0.0f, 1.0f, 0.0f, 1.0f, // v1, c1
        0.5f, -0.5f, 0.0f, 0.0f, 0.0f, 1.0f, 1.0f,  // v2, c2
        0.5f,  0.5f, 0.0f, 0.5f, 1.0f, 1.0f, 1.0f   // v3, c3
};

GLushort indices[6] = {0, 1, 2, 0, 2, 3};
LOGD("VAOVBO sample creates shader.");

mShaderProgram = GLUtils::CreateProgram(VAOVBOVertexShader, VAOVBOFragmentShader, mVertexShader, mFragmentShader);

// Generate VAO and define how data is stored
glGenVertexArrays(1, &mVAO);
glBindVertexArray(mVAO);

// Generate VBO and load data
glGenBuffers(1, &mVBO);
glBindBuffer(GL_ARRAY_BUFFER, mVBO);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

// Generate EBO and load data
glGenBuffers(1, &mEBO);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mEBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

// Specify the layout of the vertex data
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 7 * sizeof(float), (void*)(0));
glEnableVertexAttribArray(0);

glVertexAttribPointer(1, 4, GL_FLOAT, GL_FALSE, 7 * sizeof(float), (void*)(3 * sizeof(float)));
glEnableVertexAttribArray(1);

// Unbind the VAO (it's a good practice to unbind any VAO to prevent accidental modification)
glBindVertexArray(GL_NONE);
```

Drawing code
```cpp
glClear(GL_STENCIL_BUFFER_BIT | GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
glClearColor(1.0, 1.0, 1.0, 1.0);
glUseProgram(mShaderProgram);
glBindVertexArray(mVAO);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, (void*)(0));
glBindVertexArray(GL_NONE);
```

<div style="display: flex; justify-content: center; align-items: center;">
    <img src="menu.jpg" style="width: 50%; margin-left: 35%;">
    <img src="vaovbo.jpg" style="width: 50%;">
</div>

# References

- https://github.com/githubhaohao/NDK_OpenGLES_3_0
- https://learnopengl.com/Getting-started/Hello-Triangle