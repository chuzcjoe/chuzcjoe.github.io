---
title: Rendering Using Native OpenGL on Android - 1
author: Joe Chu
date: 2024-06-19 00:35:26
tags: [opengl, android]
categories:
- CGV
---

1. Use Android SurfaceView for rendering surface.
2. In native code, create a rendering thread and call OpenGL for rendering in the same thread.

<!-- more -->

# 1. Workflow

<p align="center">
    <img src="workflow.png" title="A regular image" width="1000px" height="800px">
</p>

# 2. Demo

Source code can be found on my github page: https://github.com/chuzcjoe/nativegl

On Android side, we start/stop rendering at different stages of the SurfaceView lifecycle.
```kotlin
class SurfaceViewHolder : SurfaceHolder.Callback {
    override fun surfaceChanged(holder: SurfaceHolder, format: Int, w: Int, h: Int) {
        JNIProxy.setSurface(holder.surface)
        JNIProxy.startRender()
    }

    override fun surfaceCreated(holder: SurfaceHolder) {
        JNIProxy.calPixel()
        JNIProxy.setSurface(holder.surface)
        JNIProxy.startRender()
    }

    override fun surfaceDestroyed(holder: SurfaceHolder) {
        JNIProxy.stopRender()
        JNIProxy.setSurface(null)
    }
}
```

To start rendering, we will start a new rendering thread. In this new thread, we will initialize EGL settings and start drawing with OpenGL APIs.
```cpp
void GLBase::StartRenderThread(){
    if (!init){
        _th = std::thread(RenderThread, this);
        init = !init;
    }
    running = true;
}

void GLBase::RenderThread(GLBase* obj){
    obj->RenderLoop();
}

void GLBase::RenderLoop(){
    bool rendering = true;
    while (rendering) {
        if (running){
            // process incoming messages
            if (eglSetting._msg == EGLSetting::RenderThreadMessage::MSG_WINDOW_SET) {
                initEGL();
            }
            if (eglSetting._msg == EGLSetting::RenderThreadMessage::MSG_RENDER_LOOP_EXIT) {
                rendering = false;
                DestroyRender();
            }
            eglSetting._msg = EGLSetting::RenderThreadMessage::MSG_NONE;

            if (!window_set) {
                usleep(16000);
                continue;
            }

            if (eglSetting._display) {
                std::lock_guard<std::mutex> lock(eglSetting._mutex);
                DrawFrame();
                if (!eglSwapBuffers(eglSetting._display, eglSetting._surface)) {
                    LOG_INFO("GLrenderS::eglSwapBuffers() returned error %d", eglGetError());
                }
            } else {
                usleep(16000);
            }
        } else {
            usleep(16000);
        }
    }
}
```

If everything works well, you should see a green triangle at the center of the screen.
<p align="center">
    <img src="triangle.jpg" title="A regular image" width="300px" height="500px">
</p>