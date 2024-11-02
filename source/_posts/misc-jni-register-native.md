---
title: JNI Registers Native Methods
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
  - position: left
    type: categories
date: 2024-10-23 20:50:42
tags: [jni, android]
categories:
- misc
---

Register native C++ methods for Java to access them.

<!-- more -->

# 1. Introduction

In Android applications, interacting with native C++ code through the Java Native Interface (JNI) is common, as many powerful and efficient libraries—especially those for image processing, rendering, and video/audio processing—are implemented in C++.

JNI allows Java code to call and be called by native code. In Java, we can declare a native method that is implemented in C++ code.

```java
public class JNIActivity extends AppCompatActivity {

    // Load the native library when the class is loaded
    static {
        System.loadLibrary("jnidemo");
    }

    // Declare a native method that is implemented in the C++ code
    public native String getMessageFromJNI();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_jni);

        // Call the native method and display the result
        TextView tvMessage = findViewById(R.id.tv_message);
        tvMessage.setText(getMessageFromJNI());
    }
}
```

Accordingly, we can add a C++ module and implement the native method defined in Java.

```cpp
extern "C"
JNIEXPORT jstring JNICALL
Java_com_example_jnidemo_JNIActivity_getMessageFromJNI(JNIEnv *env, jobject thiz) {
    std::string hello = "Hello from C++";
    return env->NewStringUTF(hello.c_str());
}
```

In JNI, the naming convention `Java_<package>_<class>_<methodName>` is required to link Java methods with their corresponding native C++ implementations. This naming scheme helps JNI locate the correct C++ function when the native method is called from Java. JNI's naming convention also helps avoid function name collisions across packages or classes. For instance, if you have a similar method in a different class or package, the convention makes sure each native method has a unique name based on its Java class and package.

The JVM automatically links the native methods to their implementations by name when you call the `System.loadLibrary()` method to load your shared library.

# 2. JNI_OnLoad

When to use `JNI_OnLoad`?

`JNI_OnLoad` is a special function in JNI that is automatically called when a native shared library is loaded into the JVM through `System.loadLibrary` in Java.

`JNI_OnLoad` is typically used if:
1. You want to customize the registration process or register multiple methods at once (e.g., for complex scenarios or performance optimization).
2. You don’t want to follow the JNI naming convention and prefer more control over method registration (e.g., for flexibility or to avoid long, cumbersome method names).
3. You have initialization code to run when the library is loaded.

We are going to discuss more about the second scenario, where we aim to establish custom naming conventions for our native methods. We still kepp the same method name in Java.

```java
public native String getMessageFromJNI();
```

However, in native C++ code, we have a new customized name for the corresponding java method.

```c++
jstring sendMessage(JNIEnv *env, jobject thiz) {
    std::string hello = "Hello from C++";
    return env->NewStringUTF(hello.c_str());
}
```

If we try to use `getMessageFromJNI()` anywhere in Java code, we will get a `No implementation` error message. The way to link them is to register native methods dynamically using `RegisterNatives` in `JNI_OnLoad`. This function lets you map Java native methods to any C++ function, bypassing the strict naming convention.

```c++
jstring sendMessage(JNIEnv *env, jobject thiz) {
    std::string hello = "Hello from C++";
    return env->NewStringUTF(hello.c_str());
}

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void* reserved) {
    JNIEnv* env;
    if (vm->GetEnv(reinterpret_cast<void**>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return JNI_ERR;
    }

    jclass cls = env->FindClass("com/example/jnidemo/JNIActivity");
    if (cls == nullptr) {
        return JNI_ERR; // Class not found
    }

    const JNINativeMethod methods[] = {
            {"getMessageFromJNI", "()Ljava/lang/String;", reinterpret_cast<void*>(sendMessage)}
    };

    if (env->RegisterNatives(cls, methods, sizeof(methods) / sizeof(methods[0])) < 0) {
        return JNI_ERR; // Failed to register methods
    }

    return JNI_VERSION_1_6;
}
```

1. JNI Version Check: The JNI_OnLoad function checks that the JNI version is compatible (e.g., JNI_VERSION_1_6).
2. Find Java Class: FindClass locates the Java class JNIActivity in which the native methods are declared.
3. Define Native Methods: The JNINativeMethod struct associates Java method names with the corresponding C++ functions. Each entry contains:
    - Java method name (as a string)
    - Method signature (in JNI format)
    - Pointer to the native function
4. Register Native Methods: RegisterNatives links the Java method names to the C++ implementations.
