---
title: Learn OpenGLES 4
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
date: 2024-07-29 23:39:40
tags: [opengles]
categories:
- cpp
---

Framebuffer.

<!-- more -->

Source code: https://github.com/chuzcjoe/learnopengles

# 1. FrameBuffers

Framebuffer is a portion of memory in GPU that contains data(color buffer, depth buffer and stencil buffer) representing all pixels in a video frame. It is an off-screen rendering destination where you can render images or perform post-processing effects before displaying the final result on the screen.

What we have done so far are on top of the render buffers attached to the default framebuffer. OpenGLES allows us to define our own framebuffer.

# 2. Create framebuffer

```cpp
GLuint mFBO;
glGenFramebuffers(1, &mFBO);
glBindFramebuffer(GL_FRAMEBUFFER, mFBO);
```

After binding to a framebuffer, all the read & write operations will affect the current bound framebuffer.

# 3. Attachment

A valid framebuffer needs to:

1. Attach at least one buffer(color, depth, stencil)
2. At least one color attachment.
3. Attachments should have reserved memory.
4. Each buffer should have the same number of samples.

```cpp
GLuint mFBO;
GLuint mOnScreenTextureID;

glGenFramebuffers(1, &mFBO);
glBindFramebuffer(GL_FRAMEBUFFER, mFBO);
glGenTextures(1, &mOnScreenTextureID);
glBindTexture(GL_TEXTURE_2D, mOnScreenTextureID);
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, mImage.width, mImage.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);
// attach texture to framebuffer
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, mOnScreenTextureID, 0);
```

# 4. Config VAO, VBO and EBO

```cpp
GLfloat vertices[] = {
        -1.0f,  1.0f, 0.0f,  // Top left
        -1.0f, -1.0f, 0.0f,  // Bottom left
        1.0f, -1.0f, 0.0f,   // Bottom right
        1.0f,  1.0f, 0.0f,   // Top right
};

GLfloat onScreenTexCoords[] = {
        0.0f,  0.0f,        // top left
        0.0f,  1.0f,        // bottom left
        1.0f,  1.0f,        // bottom right
        1.0f,  0.0f         // top right
};

GLfloat offScreenTexCoords[] = {
        0.0f,  1.0f,        // top left
        0.0f,  0.0f,        // bottom left
        1.0f,  0.0f,        // bottom right
        1.0f,  1.0f         // top right
};

GLushort indices[] = {0, 1, 2, 0, 2, 3 };

glGenVertexArrays(2, mVAO);

// bind first VAO for offscreen rendering
glBindVertexArray(mVAO[0]);
glGenBuffers(3, mVBO);
glBindBuffer(GL_ARRAY_BUFFER, mVBO[0]);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)(0));
glEnableVertexAttribArray(0);
glBindBuffer(GL_ARRAY_BUFFER, mVBO[1]);
glBufferData(GL_ARRAY_BUFFER, sizeof(offScreenTexCoords), offScreenTexCoords, GL_STATIC_DRAW);
glVertexAttribPointer(2, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)(0));
glEnableVertexAttribArray(2);
glGenBuffers(1, &mEBO);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mEBO);
glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
// end of first VAO

// bind second VAO for onscreen rendering
glBindVertexArray(mVAO[1]);
glBindBuffer(GL_ARRAY_BUFFER, mVBO[0]);
glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);
glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, 3 * sizeof(float), (void*)(0));
glEnableVertexAttribArray(0);
glBindBuffer(GL_ARRAY_BUFFER, mVBO[2]);
glBufferData(GL_ARRAY_BUFFER, sizeof(onScreenTexCoords), onScreenTexCoords, GL_STATIC_DRAW);
glVertexAttribPointer(1, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), (void*)(0));
glEnableVertexAttribArray(1);
glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, mEBO);
glBindVertexArray(GL_NONE);
// end of second VAO

// image texture
glGenTextures(1, &mOffScreenTextureID);
glBindTexture(GL_TEXTURE_2D, mOffScreenTextureID);
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, mImage.width, mImage.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, mImage.planes[0]);
glBindTexture(GL_TEXTURE_2D, GL_NONE);

// FrameBuffer
glGenFramebuffers(1, &mFBO);
glBindFramebuffer(GL_FRAMEBUFFER, mFBO);
glGenTextures(1, &mOnScreenTextureID);
glBindTexture(GL_TEXTURE_2D, mOnScreenTextureID);
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, mImage.width, mImage.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, nullptr);
glFramebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, mOnScreenTextureID, 0);

if (glCheckFramebufferStatus(GL_FRAMEBUFFER)!= GL_FRAMEBUFFER_COMPLETE) {
    LOGE("FBOSample::CreateFrameBufferObj glCheckFramebufferStatus status != GL_FRAMEBUFFER_COMPLETE");
    return;
}
glBindTexture(GL_TEXTURE_2D, GL_NONE);
glBindFramebuffer(GL_FRAMEBUFFER, GL_NONE);
```

# 4. Shaders
```cpp
// FrameBuffer Shader
const char* FBOOFFScreenVertexShader = VERTEX_SHADER(
       layout(location = 0) in vec3 aPosition;
       layout(location = 2) in vec2 aTexCoord;
       out vec2 vTexCoord;
       void main() {
           gl_Position = vec4(aPosition, 1.);
           vTexCoord = aTexCoord;
       }
);

const char* FBOOFFScreenFragmentShader = FRAGMENT_SHADER(
     precision mediump float;
     in vec2 vTexCoord;
     uniform sampler2D offScreenTexture;
     out vec4 FragColor;
     void main() {
         vec4 color = texture(offScreenTexture, vTexCoord);
         float gray = color.r * 0.299 + color.g * 0.587 + color.b * 0.114;
         FragColor = vec4(vec3(gray), 1.0);
     }
);

const char* FBOONScreenVertexShader = VERTEX_SHADER(
       layout(location = 0) in vec3 aPosition;
       layout(location = 1) in vec2 aTexCoord;
       out vec2 vTexCoord;
       void main() {
           gl_Position = vec4(aPosition, 1.);
           vTexCoord = aTexCoord;
       }
);

const char* FBOONScreenFragmentShader = FRAGMENT_SHADER(
        precision mediump float;
        in vec2 vTexCoord;
        uniform sampler2D onScreenTexture;
        out vec4 FragColor;
        void main() {
            FragColor = texture(onScreenTexture, vTexCoord);
            // FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        }
);
```

# 5. Draw

To use framebuffer for off-screen rendering, we need two passes(draw twice).
```cpp
glViewport(0, 0, mImage.width, mImage.height);

// Off-screen rendering
glBindFramebuffer(GL_FRAMEBUFFER, mFBO);
glClearColor(0.1f, 0.1f, 0.1f, 1.0f);
glClear(GL_COLOR_BUFFER_BIT);
glUseProgram(mFBOProgram);
glBindVertexArray(mVAO[0]);
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, mOffScreenTextureID);
glUniform1i(mOffScreenSamplerLoc, 0);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, (void*)(0));
glBindVertexArray(GL_NONE);
glBindTexture(GL_TEXTURE_2D, GL_NONE);

GLenum error = glGetError();
if (error != GL_NO_ERROR) {
    LOGE("OpenGL error after off-screen rendering: %d", error);
}

// On-screen rendering
glBindFramebuffer(GL_FRAMEBUFFER, 0);
glViewport(0, 0, width, height);
glUseProgram(mShaderProgram);
glBindVertexArray(mVAO[1]);
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, mOnScreenTextureID);
glUniform1i(mOnScreenSamplerLoc, 0);
glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_SHORT, (void*)(0));
glBindTexture(GL_TEXTURE_2D, GL_NONE);
glBindVertexArray(GL_NONE);

error = glGetError();
if (error != GL_NO_ERROR) {
    LOGE("OpenGL error after on-screen rendering: %d", error);
}
```

<div style="display: flex; justify-content: center; align-items: center;">
    <img src="menu.jpg" style="width: 50%; margin-left: 35%;">
    <img src="fbo.jpg" style="width: 50%;">
</div>

# References

- https://learnopengl.com/Advanced-OpenGL/Framebuffers
- https://github.com/githubhaohao/NDK_OpenGLES_3_0?tab=readme-ov-file