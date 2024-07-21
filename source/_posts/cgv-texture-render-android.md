---
title: Rendering Using Native OpenGL on Android - 2
author: Joe Chu
date: 2024-06-23 21:07:42
tags: [opengl, android]
categories:
- CGV
---

We will load a jpeg file as a texture image and render it on the screen.

<!-- more -->

# 1. Introduction

Please check my previous post to learn how to render a simple triangle on the screen using native OpenGL on Android.
https://chuzcjoe.github.io/2024/06/19/cgv-native-opengl-android/

We will continue to use the same codebase to add textures. 

You can find the source code: https://github.com/chuzcjoe/nativegl/tree/load_texture

In this project, we also need third party library(libjpeg) for loading a jpeg image and use it as our texture for rendering. For more details on how to compile libjpeg and add it to our project, please check out my another post: https://chuzcjoe.github.io/2024/06/22/misc-cross-compile-libjpeg-for-android-armv8a/

In my provided source code, I've included everything you need. You should be able to run it on most of the armv8a arch Android devices without any issues.

# 2. Details

Most part of the code should remain the same except for some additional operations to load and bind textures.

A customized function to load a jpeg.
```cpp
unsigned char *GLRender::loadJPEG(const char *filename, int &width, int &height) {
    std::ifstream file(filename, std::ios::binary | std::ios::ate);
    if (!file.is_open()) {
        std::cerr << "Error: Cannot open file " << filename << std::endl;
        return nullptr;
    }

    std::streamsize fileSize = file.tellg();
    file.seekg(0, std::ios::beg);

    std::vector<unsigned char> buffer(fileSize);
    if (!file.read(reinterpret_cast<char*>(buffer.data()), fileSize)) {
        std::cerr << "Error: Cannot read file " << filename << std::endl;
        return nullptr;
    }

    tjhandle tjInstance = tjInitDecompress();
    if (tjInstance == nullptr) {
        std::cerr << "Error: tjInitDecompress failed" << std::endl;
        return nullptr;
    }

    int jpegSubsamp, jpegColorspace;
    if (tjDecompressHeader3(tjInstance, buffer.data(), buffer.size(), &width, &height, &jpegSubsamp, &jpegColorspace) != 0) {
        std::cerr << "Error: tjDecompressHeader3 failed: " << tjGetErrorStr() << std::endl;
        tjDestroy(tjInstance);
        return nullptr;
    }

    std::vector<unsigned char> imageBuffer(width * height * tjPixelSize[TJPF_RGB]);
    if (tjDecompress2(tjInstance, buffer.data(), buffer.size(), imageBuffer.data(), width, 0, height, TJPF_RGB, 0) != 0) {
        std::cerr << "Error: tjDecompress2 failed: " << tjGetErrorStr() << std::endl;
        tjDestroy(tjInstance);
        return nullptr;
    }

    // Flip the image vertically
    unsigned char *flippedImage = new unsigned char[width * height * tjPixelSize[TJPF_RGB]];
    int rowSize = width * tjPixelSize[TJPF_RGB];

    for (int y = 0; y < height; ++y) {
        std::copy(
                imageBuffer.begin() + (height - 1 - y) * rowSize,
                imageBuffer.begin() + (height - y) * rowSize,
                flippedImage + y * rowSize
        );
    }

    tjDestroy(tjInstance);
    return flippedImage;
}
```

Prepare and config texture.
```cpp
void GLRender::surfaceCreate() {
    tProgram = createProgram(vertexShader, fragmentShader);
    aPositionLocation  = glGetAttribLocation(tProgram, "a_Position");
    aTexturePosition = glGetAttribLocation(tProgram, "a_Texture");

    glGenVertexArrays(1, &VAO);
    glGenBuffers(1, &VBO);
    glGenBuffers(1, &EBO);

    glBindVertexArray(VAO);

    int width, height;
    glGenTextures(1, &_texture);
    glActiveTexture(GL_TEXTURE0); // activated by default
    glBindTexture(GL_TEXTURE_2D, _texture);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

    auto data = loadJPEG("/data/local/tmp/jpeg_demo/hdr.jpg", width, height);

    if (data) {
        // generate texture
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
        glGenerateMipmap(GL_TEXTURE_2D);
        LOG_INFO("load texture success, width: %d, height: %d\n", width, height);

    } else {
        LOG_ERROR("load texture error");
    }

    glBindBuffer(GL_ARRAY_BUFFER, VBO);
    glBufferData(GL_ARRAY_BUFFER, sizeof(vertices), vertices, GL_STATIC_DRAW);

    glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, EBO);
    glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);

    glVertexAttribPointer(aPositionLocation, 3, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)0);
    glEnableVertexAttribArray(aPositionLocation);

    glVertexAttribPointer(aTexturePosition, 2, GL_FLOAT, GL_FALSE, 5 * sizeof(float), (void*)(3 * sizeof(float)));
    glEnableVertexAttribArray(aTexturePosition);

    glUseProgram(tProgram);
    glUniform1i(glGetUniformLocation(tProgram, "texture_load"), 0);
}
```

Modify shaders.
```cpp
const char* vertexShader = VERTEX_SHADER(
        attribute vec3 a_Position;
        attribute vec2 a_Texture;
        varying vec2 TexCoord;
        void main() {
           gl_Position = vec4(a_Position, 1.0);
           TexCoord = a_Texture;
        }
);

const char* fragmentShader = FRAGMENT_SHADER(
        precision mediump float;
        varying vec2 TexCoord;
        uniform sampler2D texture_load;
        void main() {
           gl_FragColor = texture2D(texture_load, TexCoord);
        }
);
```

If you run the demo app, you should see a nice image on the entire screen. The result looks really simple, however, we managed everything with OpenGL.
<p align="center">
    <img src="demo.jpg" title="A regular image" width="600px" height="600px">
</p>