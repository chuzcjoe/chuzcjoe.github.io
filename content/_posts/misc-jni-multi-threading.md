---
title: JNI In Multi-threading
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/me.jpeg
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
date: 2024-12-23 19:56:40
tags: [jni]
categories:
- misc
---

Use JNI in the context of multi-threading.

<!-- more -->

# 1. Introduction

Using JNI (Java Native Interface) in a multithreaded environment requires careful handling to ensure thread safety, proper lifecycle management of the JVM, and the native resources. JNI can be used in the context of Java multithreading, native multithreading or both. In each case, we need to carefully handle some key factors such as thread safety, JNI attchment and error handling.

Here is a high-level diagram illustrating the operation of JVM multithreading, highlighting the interaction between Java threads and native threads.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/jni-multi-threading/jvm.png" title="A regular image" width="800px" height="700px">
</p>

Key Differences Between `JNIEnv*` and `JavaVM*`:
- `JNIEnv*` is thread-local and provides thread-specific access to JNI functions.
- `JavaVM*` is global to the JVM and allows operations across threads, such as attaching/detaching threads.

# 2. Java Multithreading

When using JNI in the context of Java multithreading, here are some key considerations.

1. **JNIEnv\* env per thread**
    - `process(JNIEnv* env, jobject thiz)`
    - Each Java thread calling into native code automatically gets its own JNIEnv*. You don't need to attach the thread to the JVM manually.
    - This pointer is thread-local and should not be shared between threads.
    - Avoid storing JNIEnv* in global variables or static storage.

2. **Thread-Safety**
    - Ensure the native code is thread-safe, especially if multiple Java threads interact with shared native resources.
    - Use synchronization mechanisms like `std::mutex` to protect shared data.

3. **Global References**
    - Use `NewGlobalRef` to create references for objects that need to be accessed by multiple threads or persist across JNI calls.
    - Always delete global references with `DeleteGlobalRef` when they are no longer needed.

4. **Local References**
    - JNI local references are valid only in the thread and scope where they are created. They must not be used across threads.
    - Use `DeleteLocalRef` to avoid memory leaks.

```java JNIActivity.java
public class JNIActivity extends AppCompatActivity {
    static {
        System.loadLibrary("jnimultithreading");
    }

    // Native methods
    private native void nativeInit();
    private native void nativeProcessData(int threadId);
    private native void nativeCleanup();
    
    // Method to be called from native code
    private void onProgressUpdate(int threadId, int progress) {
        runOnUiThread(() -> {
            statusText.setText("Thread " + threadId + ": " + progress + "%");
        });
    }

    private static final int NUM_THREADS = 4;
    private boolean isProcessing = false;
    private TextView statusText;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_jniactivity);

        // Initialize native resources
        nativeInit();

        statusText = findViewById(R.id.status_text);
        Button btnStartThreads = findViewById(R.id.btn_start_threads);
        btnStartThreads.setOnClickListener(v -> startProcessing());
    }

    private void startProcessing() {
        if (isProcessing) return;
        isProcessing = true;
        statusText.setText("Processing started...");

        // Create and start multiple Java threads
        Thread[] threads = new Thread[NUM_THREADS];
        for (int i = 0; i < NUM_THREADS; i++) {
            final int threadId = i;
            threads[i] = new Thread(() -> {
                nativeProcessData(threadId);
            });
            threads[i].start();
        }

        // Start a monitoring thread to wait for all threads to complete
        new Thread(() -> {
            try {
                for (Thread thread : threads) {
                    thread.join();
                }
                runOnUiThread(() -> {
                    statusText.setText("Processing completed!");
                    isProcessing = false;
                });
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }).start();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Cleanup native resources
        nativeCleanup();
    }
}
```

```cpp jnimultithreading.cpp
#include <jni.h>
#include <string>
#include <android/log.h>
#include <unistd.h>
#include <mutex>

#define LOG_TAG "JNIMultiThreading"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

// Mutex for thread synchronization
std::mutex g_mutex;

// Global references
jclass g_activity_class = nullptr;  // Global reference to the Activity class
jmethodID g_progress_method = nullptr;  // Method ID (not a global reference)

extern "C" {

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    JNIEnv* env;
    if (vm->GetEnv((void**)&env, JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }

    // Find the Activity class
    jclass localClass = env->FindClass("com/example/jnimultithreading/JNIActivity");
    if (localClass == nullptr) {
        return JNI_ERR;
    }

    // Create global reference to the class
    g_activity_class = (jclass)env->NewGlobalRef(localClass);
    env->DeleteLocalRef(localClass);  // Delete the local reference

    // Cache the method ID
    g_progress_method = env->GetMethodID(g_activity_class, "onProgressUpdate", "(II)V");

    return JNI_VERSION_1_6;
}

JNIEXPORT void JNICALL
Java_com_example_jnimultithreading_JNIActivity_nativeProcessData(JNIEnv *env, jobject thiz, jint thread_id) {
    // Simulate work with progress updates
    for (int i = 0; i <= 100; i += 20) {
        {
            std::lock_guard<std::mutex> lock(g_mutex);
            LOGI("Thread %d progress: %d%%", thread_id, i);
            env->CallVoidMethod(thiz, g_progress_method, thread_id, i);
        }
        usleep(500000); // Sleep for 500ms
    }
}

JNIEXPORT void JNICALL
Java_com_example_jnimultithreading_JNIActivity_nativeInit(JNIEnv *env, jobject thiz) {
    LOGI("Native resources initialized");
}

JNIEXPORT void JNICALL
Java_com_example_jnimultithreading_JNIActivity_nativeCleanup(JNIEnv *env, jobject thiz) {
    if (g_activity_class != nullptr) {
        env->DeleteGlobalRef(g_activity_class);
        g_activity_class = nullptr;
    }
    g_progress_method = nullptr;  // Just set to null, no need to delete
    LOGI("Native resources cleaned up");
}

JNIEXPORT void JNICALL JNI_OnUnload(JavaVM* vm, void* reserved) {
    JNIEnv* env;
    if (vm->GetEnv((void**)&env, JNI_VERSION_1_6) != JNI_OK) {
        return;
    }

    // Clean up global references
    if (g_activity_class != nullptr) {
        env->DeleteGlobalRef(g_activity_class);
        g_activity_class = nullptr;
    }
}
}
```

# 3. Native Multithreading

If multithreading happens in native code (rather than in Java), there are notable differences in how threads are managed, synchronized, and interact with the Java Virtual Machine (JVM). The most significant difference is:

**Thread Lifecycle**
    - Created and managed outside of the JVM, typically using threading APIs like `std::thread` (C++), POSIX threads, or platform-specific APIs.
    - Do not have an automatic relationship with the JVM; they must explicitly attach to the JVM using `AttachCurrentThread` if they need to interact with Java objects.
    - After their work is done, they must detach using `DetachCurrentThread` to avoid memory leaks.

**JavaVM***
To attach/detach a native thread from JVM, we need the `JavaVM*` pointer. The `JavaVM*` pointer in the JNI represents the JVM instance running the Java code. Unlike the `JNIEnv*`, which is thread-local and specific to a single thread, the `JavaVM*` is global and shared across all threads in the JVM. It provides a way for native code to interact with the JVM at a higher level, enabling operations that span multiple threads.

As we mentioned in the diagram in section 1, for threads created in native code:
- The `JavaVM*` is commonly used for attaching and detaching native threads to/from the JVM, ensuring they can use JNI functions.
- Native threads must attach themselves to the JVM using the `JavaVM*` before accessing JNI.

**Demo**
To illustrate how JNI operates in the presence of native threads, we will create a more complex example.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/jni-multi-threading/demo.png" title="A regular image" width="800px" height="700px">
</p>

```java MainActivity.java
package com.example.jnimultinativethread;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private TextView outputText;
    private StringBuilder logBuilder = new StringBuilder();
    private NativeWorker nativeWorker;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private final ThreadProgressCallback callback = value -> {
        Thread currentThread = Thread.currentThread();
        long nativeThreadId = nativeWorker.getNativeThreadId();
        Log.i("MainActivity", "JC, Callback running on thread: " + nativeThreadId);

        // Process on native thread
        logBuilder.append("Java received: ").append(value).append("\n");
        int result = nativeWorker.processValue(value);
        logBuilder.append("Native processed and returned: ").append(result).append("\n");

        // Test the thread-registered method
        int threadResult = nativeWorker.threadRegisteredMethod(value);
        logBuilder.append("Thread-registered method returned: ").append(threadResult).append("\n");

        // Only use UI thread for updating TextView
        final String output = logBuilder.toString();
        mainHandler.post(() -> outputText.setText(output));
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        outputText = findViewById(R.id.outputText);
        Button startButton = findViewById(R.id.startButton);
        
        nativeWorker = new NativeWorker(callback);

        startButton.setOnClickListener(v -> {
            logBuilder.setLength(0);
            outputText.setText("");
            logBuilder.append("Starting async work...\n");
            outputText.setText(logBuilder.toString());
            
            nativeWorker.startAsyncWork();
        });
    }
}
```

```cpp native-lib.cpp
#include <jni.h>
#include <string>
#include <thread>
#include <android/log.h>

#define LOG_TAG "NativeLib"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

// Global reference to Java VM and callback
static JavaVM* g_vm = nullptr;
static jobject g_callback_object = nullptr;
static jmethodID g_callback_method = nullptr;
static jclass g_native_worker_class = nullptr;

// New method that will be registered from the native thread
jint threadRegisteredMethod(JNIEnv* env, jobject thiz, jint value) {
    LOGI("JC, threadRegisteredMethod called on thread: %ld", std::this_thread::get_id());
    return value * 3;
}

// Worker thread function that will call back to Java
void nativeThread(int initialValue) {
    JNIEnv* env;
    bool needsDetach = false;

    // Attach thread to JVM if needed
    int getEnvResult = g_vm->GetEnv((void**)&env, JNI_VERSION_1_6);
    if (getEnvResult == JNI_EDETACHED) {
        if (g_vm->AttachCurrentThread(&env, nullptr) == JNI_OK) {
            needsDetach = true;
        } else {
            LOGI("Failed to attach thread to JVM");
            return;
        }
    }

    LOGI("JC, Native thread started with ID: %ld", std::this_thread::get_id());

    // Register the new native method using the cached class reference
    if (g_native_worker_class != nullptr) {
        JNINativeMethod threadMethod[] = {
            {"threadRegisteredMethod", "(I)I", reinterpret_cast<void*>(threadRegisteredMethod)}
        };
        if (env->RegisterNatives(g_native_worker_class, threadMethod, 1) < 0) {
            LOGI("Failed to register thread method");
        } else {
            LOGI("Successfully registered thread method");
        }
    }

    // Simulate some work
    std::this_thread::sleep_for(std::chrono::milliseconds(1000));

    // Call back to Java with the value
    env->CallVoidMethod(g_callback_object, g_callback_method, initialValue);

    // Detach thread if we attached it
    if (needsDetach) {
        g_vm->DetachCurrentThread();
    }
}

void startAsyncWork(JNIEnv* env, jobject thiz) {
    // Get the callback field from NativeWorker
    jfieldID callbackField = env->GetFieldID(env->GetObjectClass(thiz),
                                           "callback",
                                           "Lcom/example/jnimultinativethread/ThreadProgressCallback;");

    // Get callback object and method
    jobject localCallback = env->GetObjectField(thiz, callbackField);
    jclass callbackClass = env->GetObjectClass(localCallback);

    // Create global reference to callback object
    if (g_callback_object != nullptr) {
        env->DeleteGlobalRef(g_callback_object);
    }
    g_callback_object = env->NewGlobalRef(localCallback);

    // Get callback method ID
    g_callback_method = env->GetMethodID(callbackClass, "onNativeCallback", "(I)V");

    // Start native thread with initial value
    std::thread worker(nativeThread, 42);
    worker.detach();
}

jint processValue(JNIEnv* env, jobject thiz, jint value) {
    LOGI("JC, processValue called on thread: %ld", std::this_thread::get_id());
    return value * 2;
}

// Native method mapping table for initial registration
static JNINativeMethod methods[] = {
    {"startAsyncWork", "()V", reinterpret_cast<void*>(startAsyncWork)},
    {"processValue", "(I)I", reinterpret_cast<void*>(processValue)}
};

extern "C" JNIEXPORT jint JNICALL
JNI_OnLoad(JavaVM* vm, void* reserved) {
    g_vm = vm;

    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }

    // Find and cache the NativeWorker class
    jclass localClass = env->FindClass("com/example/jnimultinativethread/NativeWorker");
    if (localClass == nullptr) {
        return JNI_ERR;
    }
    g_native_worker_class = (jclass)env->NewGlobalRef(localClass);

    // Register initial native methods
    if (env->RegisterNatives(g_native_worker_class, methods, sizeof(methods)/sizeof(methods[0])) < 0) {
        return JNI_ERR;
    }

    return JNI_VERSION_1_6;
}

extern "C" JNIEXPORT jlong JNICALL
Java_com_example_jnimultinativethread_NativeWorker_getNativeThreadId(JNIEnv* env, jobject thiz) {
    return (jlong)pthread_self();
}

extern "C" JNIEXPORT void JNICALL
JNI_OnUnload(JavaVM* vm, void* reserved) {
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return;
    }

    // Clean up global references
    if (g_callback_object != nullptr) {
        env->DeleteGlobalRef(g_callback_object);
        g_callback_object = nullptr;
    }
    if (g_native_worker_class != nullptr) {
        env->DeleteGlobalRef(g_native_worker_class);
        g_native_worker_class = nullptr;
    }
}
```

It is worth noting that `Thread.getId()` in Java and `std::this_thread::get_id()` in C++ use different numbering systems for thread IDs. To make them match and be more comparable, we return `pthread_self()` from the native code and let Java obtained the native thread id.

The log information confirms the accuracy of our illustration above.
```
JC, Native thread started with ID: 493381438640
JC, Callback running on thread: 493381438640
JC, processValue called on thread: 493381438640
JC, threadRegisteredMethod called on thread: 493381438640
```