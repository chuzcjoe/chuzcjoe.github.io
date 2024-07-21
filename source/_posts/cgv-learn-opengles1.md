---
title: Learn OpenGLES 1
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
date: 2024-07-21 12:31:47
tags: [opengles]
categories:
- CGV
cover: 2024/07/21/cgv-learn-opengles1/openglesnew.png
---

Environment setup in Android Studio and draw our first triangle.

<!-- more -->

Source code: https://github.com/chuzcjoe/learnopengles

# 1. Project Overview

OpenGL ES is a subset of the OpenGL computer graphics rendering application programming interface (API) designed for embedded devices such as mobile phones, tablets, and gaming consoles. OpenGL ES serves as the primary low-level graphics API for Android. It's used for rendering 2D and 3D graphics on Android devices. Android provides GLSurfaceView, a specialized view for OpenGL ES rendering, making it easier to integrate OpenGL ES content into Android UI.

This project leverages an excellent learning resource available at https://github.com/githubhaohao/NDK_OpenGLES_3_0. Thanks the author for make it open souce. Building upon the original code, this project introduces several customizations, including the use of the more modern Kotlin language for development and modifications to some native C++ APIs to better align with the project's requirements. Additionally, the learning approach has been slightly adjusted. The primary aim of this project is educational.

# 2. Environment Setup

The UI is simple. On the top right corner, we have a menu that allows us to select the GL demo we want to render on the center screen. For example, here we only have one option which is to render a triangle on the screen. As we continue to make progress, more samples will be added to the list.

<div style="display: flex; justify-content: center; align-items: center;">
    <img src="UI.png" style="width: 50%; margin-left: 35%;">
    <img src="triangle.png" style="width: 50%;">
</div>

# 3. Design

<p align="center">
    <img src="design.png" title="A regular image" width="1000px" height="800px">
</p>

**MyGLSurfaceView** inherits from **GLSurfaceView**, configs EGL and set Render.
```kotlin
class MyGLSurfaceView(context: Context?, private val mGLRender: MyGLRender, attrs: AttributeSet? = null) : GLSurfaceView(context) {
    private val TAG = "MyGLSurfaceView"
    private var mRatioWidth: Int = 0
    private var mRatioHeight: Int = 0

    init {
        setEGLContextClientVersion(3)
        setEGLConfigChooser(8, 8, 8, 8, 16, 8)
        setRenderer(mGLRender)
        renderMode = RENDERMODE_WHEN_DIRTY
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        val width = MeasureSpec.getSize(widthMeasureSpec)
        val height = MeasureSpec.getSize(heightMeasureSpec)

        if (0 == mRatioWidth || 0 == mRatioHeight) {
            setMeasuredDimension(width, height)
        } else {
            if (width < height * mRatioWidth / mRatioHeight) {
                setMeasuredDimension(width, width * mRatioHeight / mRatioWidth)
            } else {
                setMeasuredDimension(height * mRatioWidth / mRatioHeight, height)
            }
        }
    }

    fun setAspectRatio(width: Int, height: Int) {
        Log.d(TAG, "setAspectRatio() called with: width = [$width], height = [$height]")
        require(!(width < 0 || height < 0)) { "Size cannot be negative." }
        mRatioWidth = width
        mRatioHeight = height
        requestLayout()
    }

    fun getRender() : MyGLRender {
        return mGLRender
    }
```

**MyGLRender** implements three override functions that handle different **MyGLSurfaceView** events.
```kotlin
class MyGLRender : GLSurfaceView.Renderer {
    private val mNativeRender: MyNativeRender = MyNativeRender()

    override fun onSurfaceCreated(gl: GL10?, config: EGLConfig?) {
        mNativeRender.native_SurfaceCreated()
    }

    override fun onSurfaceChanged(gl: GL10?, width: Int, height: Int) {
        mNativeRender.native_SurfaceChanged(width, height)
    }

    override fun onDrawFrame(gl: GL10?) {
        mNativeRender.native_DrawFrame()
    }

    fun initRenderContext() {
        mNativeRender.native_init()
    }
}
```

We also have a very important **MyNativeRender** class that loads native C++ library and can direcly call native functions.
```kotlin
class MyNativeRender {
    companion object {
      init {
         System.loadLibrary("opengles")
      }
    }

    external fun native_init()

    external fun native_uninit()

    external fun native_SurfaceCreated()

    external fun native_SurfaceChanged(width: Int, height: Int)

    external fun native_DrawFrame()

    external fun native_setSample(sample: Int)
}
```

On the native code side, we have a **GLContext** class that manages the rendering context. It is designed to be singleton pattern, since we only want one instance of the context.
```cpp
// Singleton class
class GLContext {
private:
    GLContext();
    ~GLContext();
public:
    void OnSurfaceCreated();
    void OnSurfaceChanged(int width, int height);
    void OnDrawFrame();

    void setSample(int sample);

    static GLContext* getInstance();
    static void destroyInstance();

private:
    static GLContext* mContext;
    GLBase* mSample = nullptr;
    int mWidth;
    int mHeight;
};
```

**GLBase** is the base class for all the other rendering classes. Derived classes must implement `init()`, `draw()`, `destroy()`.
```cpp
class GLBase {
public:
    GLBase() {}
    virtual ~GLBase() {}

    // must implement in samples
    virtual void init() = 0;
    virtual void draw() = 0;
    virtual void destroy() = 0;

protected:
    GLuint mVertexShader;
    GLuint mFragmentShader;
    GLuint mShaderProgram;
    int mSurfaceWidth;
    int mSurfaceHeight;
};
```

**TriangleSample** loads shaders and creates a shader program. The `draw()` function will render a triangle.
```cpp
void TriangleSample::init() {
    mShaderProgram = GLUtils::CreateProgram(TriangleVertexShader, TriangleFragmentShader, mVertexShader, mFragmentShader);
}

void TriangleSample::draw() {
    GLfloat vVertices[] = {
            0.0f,  0.5f, 0.0f,
            -0.5f, -0.5f, 0.0f,
            0.5f, -0.5f, 0.0f,
    };

    glClear(GL_STENCIL_BUFFER_BIT | GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    glClearColor(1.0, 1.0, 1.0, 1.0);

    // Use the program object
    glUseProgram (mShaderProgram);

    // Load the vertex data
    glVertexAttribPointer (0, 3, GL_FLOAT, GL_FALSE, 0, vVertices );
    glEnableVertexAttribArray (0);

    glDrawArrays (GL_TRIANGLES, 0, 3);
    glUseProgram (GL_NONE);
}

void TriangleSample::destroy() {
    if (mShaderProgram) {
        glDeleteProgram(mShaderProgram);
        mShaderProgram = GL_NONE;
    }
}
```

All the shaders will be defined in **GLShaderSources.h**
```cpp
#define VERTEX_SHADER(...) "#version 300 es\n" #__VA_ARGS__
#define FRAGMENT_SHADER(...) "#version 300 es\n" #__VA_ARGS__

const char* TriangleVertexShader = VERTEX_SHADER(
       layout(location = 0) in vec4 vPosition;
       void main() {
           gl_Position = vPosition;
       }
);

const char* TriangleFragmentShader = FRAGMENT_SHADER(
         precision mediump float;
         out vec4 FragColor;
         void main() {
             FragColor = vec4 (0.0, 1.0, 0.0, 1.0);
         }
 );
```

# References

- https://github.com/githubhaohao/NDK_OpenGLES_3_0