---
title: Learn OpenGLES 2
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
date: 2024-07-24 01:04:04
tags: [opengles]
categories:
- CGV
---

Use an image as texture map and render it on the screen.

<!-- more -->

Source code: https://github.com/chuzcjoe/learnopengles

2D texture is the most common texture type in OpenGLES. It is essentially a 2D image that adds details to the surface of an object. Texture coordinates range from 0 to 1. The figure below shows the texture coordinates and vertex coordinates in OpenGLES.

<p align="center">
    <img src="coordinates.png" title="A regular image" width="1000px" height="800px">
</p>

If we want to render a texture image, we can set the vertices and texture coordinates to be:
```cpp
GLfloat vertices[] = {
        -1.0f,  0.5f, 0.0f,  // Top left
        -1.0f, -0.5f, 0.0f,  // Bottom left
        1.0f, -0.5f, 0.0f,   // Bottom right
        1.0f,  0.5f, 0.0f,   // Top right
};

GLfloat textureCoords[] = {
        0.0f,  0.0f,        // top left
        0.0f,  1.0f,        // bottom left
        1.0f,  1.0f,        // bottom right
        1.0f,  0.0f         // top right
};
```

OpenGL uses the winding order of the vertices to determine the "front" and "back" faces of a triangle. The default winding order is counter-clockwise (CCW) for front faces. So, when drawing a rectangle using two triangles, we can specify the order to be:
```c++
GLushort indices[] = { 0, 1, 2, 0, 2, 3 };
```

Generate 2D texture in OpenGL
```c++
// generate a texture
glGenTextures(1, &mTextureID);
// set the texture object as the current activate texture object
glBindTexture(GL_TEXTURE_2D, mTextureID);
// set texture wrapping
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
glTexParameterf(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
glBindTexture(GL_TEXTURE_2D, GL_NONE);
```

Load an RGBA image as texture.

On Kotlin side, we will load an jpeg as a bitmap, convert it to byteArray, and pass it down to native C++.

```kotlin
private fun loadBitmap(resId: Int): Bitmap? {
    val fileStream = this.resources.openRawResource(resId)
    val bitmap: Bitmap? = BitmapFactory.decodeStream(fileStream)
    if (bitmap != null) {
        val buf = ByteBuffer.allocate(bitmap.byteCount)
        bitmap.copyPixelsToBuffer(buf)
        val byteArray = buf.array()
        mGLRender.setImageData(IMAGE_FORMAT_RGBA, bitmap.width, bitmap.height, byteArray)
        Log.d(TAG, "image width: ${bitmap.width}, image height: ${bitmap.height}")
    }
    return bitmap
}
```

```c++
extern "C"
JNIEXPORT void JNICALL
Java_com_example_opengles_gl_MyNativeRender_native_1setImageData(JNIEnv *env, jobject thiz, jint pixel_format, jint width, jint height, jbyteArray bytes) {
    jsize length = env->GetArrayLength(bytes);
    uint8_t* buffer = new uint8_t[length];
    env->GetByteArrayRegion(bytes, 0, length, reinterpret_cast<jbyte*>(buffer));
    GLContext::getInstance()->setImageData(pixel_format, width, height, buffer);
    delete[] buffer;
}
```

We define a `NativeImage` struct to hold our image data.
```c++
struct NativeImage {
    int width;
    int height;
    int format;
    uint8_t* planes[3];

    NativeImage() {
        width = 0;
        height = 0;
        format = 0;
        planes[0] = nullptr;
        planes[1] = nullptr;
        planes[2] = nullptr;
    }
};
```

Generate texture image.
```c++
glActiveTexture(GL_TEXTURE0);
glBindTexture(GL_TEXTURE_2D, mTextureID);
glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, mImage.width, mImage.height, 0, GL_RGBA, GL_UNSIGNED_BYTE, mImage.planes[0]);
glBindTexture(GL_TEXTURE_2D, GL_NONE);
```

Vertex/Fragment shaders
```c++
// Texture Load Shader
const char* TextureLoadVertexShader = VERTEX_SHADER(
      layout(location = 0) in vec3 aPosition;
      layout(location = 1) in vec2 aTexCoord;
      out vec2 vTexCoord;
      void main() {
          gl_Position = vec4(aPosition, 1.);
          vTexCoord = aTexCoord;
      }
);

const char* TextureLoadFragmentShader = FRAGMENT_SHADER(
        precision mediump float;
        in vec2 vTexCoord;
        uniform sampler2D sTexture;
        out vec4 FragColor;
        void main() {
            FragColor = texture(sTexture, vTexCoord);
        }
);
```

We added a new item in the sample selection. The image will be rendered as a texture map.

<div style="display: flex; justify-content: center; align-items: center;">
    <img src="menu.jpg" style="width: 50%; margin-left: 35%;">
    <img src="texture.jpg" style="width: 50%;">
</div>

# References

- https://github.com/githubhaohao/NDK_OpenGLES_3_0