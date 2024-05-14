---
title: Learn OpenGL 5
author: Joe Chu
date: 2023-11-19 20:04:33
tags: [opengl]
categories:
- CGV
---

Texture

<!-- more -->

Github source code: [link](https://github.com/chuzcjoe/opengl/tree/master/5-texture)
learning materials: [learnopengl](https://learnopengl.com/Getting-started/Textures)

# Introduction

A texture is a 2D image (or 1D or 3D) used to attach to an object. In order to map a texture to a triangle, we need to tell each vertex of the triangle a texture coordinate. By doing this, the fragment shader knows how to sample the texture and perform the interpolation.

Texture coordinates range from [0, 1]. It differs from the default OpenGL `normalized devices coordinates`.
<p align="center">
    <img src="texcoords.png" width="300px" height="300px">
</p>

# Create texture

Textures can be loaded from external files such as .png, .jpeg, etc. Then they can be further transformed into OpenGL readable texture buffers. There is an easy-to-use image library that can support popular image formats [stb_image](https://github.com/nothings/stb/blob/master/stb_image.h). It is a header-only file and can be easily added to our project.

```c++
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

int width, height, nrChannels;
unsigned char *data = stbi_load("container.jpg", &width, &height, &nrChannels, 0);
stbi_image_free(data);
```

Similar to what we have done for `VBO` and `EBO`, we also need to create texture buffer, bind texture buffer, set texture parameters and copy data to texture buffers.
- generate texture buffer
- bind texture buffer
- set parameters
- copy data to texture buffer
- generate mipmap (a collection of texture images)

**generate texture buffer**
```c++
unsigned int texture;
glGenTextures(1, &texture);  
```

**bind texture**
```c++
glBindTexture(GL_TEXTURE_2D, texture);  
```

**set parameters**
`GL_TEXTURE_WRAP_S` and `GL_TEXTURE_WRAP_T` are used for `texture wrapping`. To handle coordinates outside the range of [0, 1], OpenGL offers several options.
- GL_REPEAT
- GL_MIRRORED_REPEAT
- GL_CLAMP_TO_EDGE
- GL_CLAMP_TO_BORDER

<p align="center">
    <img src="texturewrapping.png" width="600px" height="300px">
</p>

`GL_TEXTURE_MIN_FILTER` and `GL_TEXTURE_MAG_FILTER` are used for texture filtering. Most common interpolation methods are `GL_NEAREST` and `GL_LINEAR`. If you are familiar with image processing, they should be easy for you. `GL_TEXTURE_MIN_FILTER` is used when scaling down while `GL_TEXTURE_MAG_FILTER` for scaling up.

```c++
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);	
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
```

**copy data to texture buffers**
```c++
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
```

**generate mipmap**
`mipmap` are precomputed, optimized collection of textures used to improve the rendering quality and performance of textured surfaces, especially when those surfaces are viewed from a distance or at different levels of detail. Objects at far distance can be rendered with small resolution textures, which can reduce memory. An example of mipmaps looks like this:

<p align="center">
    <img src="mipmap.png" width="300px" height="300px">
</p>

Just like texture filtering, interpolation can be performed between two mipmap levels to avoid obvious artifacts.
- GL_NEAREST_MIPMAP_NEAREST: takes the nearest mipmap to match the pixel size and uses nearest neighbor interpolation for texture sampling.
- GL_LINEAR_MIPMAP_NEAREST: takes the nearest mipmap level and samples that level using linear interpolation.
- GL_NEAREST_MIPMAP_LINEAR: linearly interpolates between the two mipmaps that most closely match the size of a pixel and samples the interpolated level via nearest neighbor interpolation.
- GL_LINEAR_MIPMAP_LINEAR: linearly interpolates between the two closest mipmaps and samples the interpolated level via linear interpolation.

`NOTE:` mipmap only works for downscaling. Texture magnification doesn't use mipmaps.

```c++
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR_MIPMAP_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
```

To generate mipmaps is easy.

```c++
glGenerateMipmap(GL_TEXTURE_2D);
```

# Apply textures

```c++
float vertices[] = {
    // positions          // colors           // texture coords
     0.5f,  0.5f, 0.0f,   1.0f, 0.0f, 0.0f,   1.0f, 1.0f,   // top right
     0.5f, -0.5f, 0.0f,   0.0f, 1.0f, 0.0f,   1.0f, 0.0f,   // bottom right
    -0.5f, -0.5f, 0.0f,   0.0f, 0.0f, 1.0f,   0.0f, 0.0f,   // bottom left
    -0.5f,  0.5f, 0.0f,   1.0f, 1.0f, 0.0f,   0.0f, 1.0f    // top left 
};
```

<p align="center">
    <img src="vertexattributepointer.png" width="800px" height="300px">
</p>

Since the vertex attributes are changed, we also need to update our vertex attribute pointer.

```c++
// position attribute
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)0);
glEnableVertexAttribArray(0);
// color attribute
glVertexAttribPointer(1, 3, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(3 * sizeof(float)));
glEnableVertexAttribArray(1);
// texture attribute
glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 8 * sizeof(float), (void*)(6 * sizeof(float)));
glEnableVertexAttribArray(2);
```

# Shaders

`vertex shader` passes texture coordinates to `fragment shader`.

```glsl
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor;
layout (location = 2) in vec2 aTexture;

out vec3 ourColor;
out vec2 TexCoord;

void main() {
   gl_Position = vec4(aPos, 1.0);
   ourColor = aColor;
   TexCoord = aTexture;
}
```

`fragment shader` reads texture coordinates from `vertex shader` and performs operations. Fragment shader is able to access the texture objects using `uniform sampler2D`. In our host program, we can later assign different textures to it. `texture` is a built-in function to sampling texture from coordinates.

```glsl
#version 330 core
out vec4 FragColor;
in vec3 ourColor;
in vec2 TexCoord;

uniform sampler2D texture1; // GL_TEXTURE0
uniform sampler2D texture2; // GL_TEXTURE1
uniform float alpha;

void main() {
   vec2 newTexCoord = vec2(1.0f - TexCoord.x, TexCoord.y);
   FragColor = mix(texture(texture1, TexCoord), texture(texture2, newTexCoord), alpha);
}
```

# Texture units

Texture units allow us to use multiple textures in our shaders by assigning texture units to different samplers we previous defined. The default texture unit is `0` and is activated by default. OpenGL should have a at least a minimum of `16` texture units for you to use. To activate others:

```c++
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, texture1);
glActiveTexture(GL_TEXTURE1);
glBindTexture(GL_TEXTURE_2D, texture2);
```

To enable texture units in the shader program, we need to set their values in our host program.

```c++
// activate shader program before we can setup uniforms
shader.activate();
glUniform1i(glGetUniformLocation(shader.getID(), "texture1"), 0);
glUniform1i(glGetUniformLocation(shader.getID(), "texture2"), 1);
```

# Demo

The demo mixes two textures, and the `up` and `down` keys will change the transparency of the cat image. Checkout the source code on my [github](https://github.com/chuzcjoe/opengl/tree/master/5-texture).

<p float="left">
  <img src="cat0.png" width="300" />
  <img src="cat1.png" width="300" /> 
</p>

<p float="left">
  <img src="cat2.png" width="300" />
  <img src="cat3.png" width="300" /> 
</p>

# References
- https://learnopengl.com/Getting-started/Textures