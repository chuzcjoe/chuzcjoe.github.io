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
date: 2024-12-23 19:56:40
tags: [jni]
categories:
- misc
---

Use JNI in the context of multi-threading.

<!-- more -->

# 1. Introduction

Using JNI (Java Native Interface) in a multithreaded environment requires careful handling to ensure thread safety, proper lifecycle management of the JVM, and the native resources. JNI can be used in the context of Java multithreading, native multithreading or both. In each case, we need to carefully handle some key factors such as thread safety, JNI attchment and error handling.

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