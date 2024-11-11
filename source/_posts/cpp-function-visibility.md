---
title: Function Visibility in C++
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
date: 2024-11-07 22:55:40
tags: [visibility]
categories:
- cpp
---

1. Function visibility across translation units.
2. Symbol visibility in shared libraries.

<!-- more -->

# 1. Introduction

In C++, function visibility generally pertains to whether a function can be accessed from outside the translation unit in which it’s defined. Control over function visibility is essential for modular code, particularly in libraries.

# 2. Internal vs. External Linkage

Functions with internal linkage are visible only within the translate unit. Marking a function as `static` limits its visibility, meaning it can't be used or "seen" outside that file. This helps avoid name conflicts across multiple files.

```cpp
static void internalFunction() {
    // Only visible within this file
}
```

**A useful remind for using `static` in a header file**:

When you put a `static` variable definition in a header file, every .cpp file that includes that header will get its own separate instance of the static variable. This means:

1. Each translation unit (each .cpp file) that includes the .h file will have its own unique copy of the static variable, rather than sharing one.
2. The static variable is not shared across translation units because static gives the variable internal linkage.

By default, functions without the `static` keyword have external linkage. This means they are visible to other translation units and can be used from other files, assuming **they are declared in a shared header file**.

```cpp
void externalFunction() {
    // Can be accessed from other files
}
```

# 3. extern Linkage

The `extern` keyword in C++ is used for various purposes related to linkage and visibility of variables and functions. A function decorated with `extern` should only be defined once in its own translate unit. When shared across other translate units, it needs to be declared before using it. However, since functions without `static` have external linkage by default, simple forward declaration also works.

```cpp
// a.cpp
#include <iostream>
void externalFunction() {
  std::cout << "externalFunction() from a.cpp\n";
}

// main.cpp
extern void externalFunction();
// void externalFunction(); // forward declaration also works
int main() {
  externalFunction();
  return 1;
}
```

# 4. extern "C" for C Linkage

- Purpose of extern "C": When compiling in C++, function names are mangled to include extra information like return type and parameter types, enabling C++ to support function overloading. However, this name mangling means C++ functions have different names than C functions, making it difficult to link C++ code with C libraries.

- To solve this, extern "C" is used to instruct the compiler not to mangle the names of the functions declared within it, making them compatible with C linkage. This is often used in headers for C libraries to allow the functions to be linked and used in C++ code.

```cpp
#ifdef __cplusplus
extern "C" {
#endif

void cFunction(int a);

#ifdef __cplusplus
}
#endif
```

# 5. extern with const Variables

In C++, `const` global variables have internal linkage by default (they are restricted to the file in which they’re defined). This prevents unintended access or modification, but if you need to access a const variable from other files, you can declare it with extern to give it external linkage.

```cpp
// a.cpp
#include <iostream>
extern const int myConstVar = 42;  // Definition with extern


// b.cpp
#include <iostream>
extern const int myConstVar;  // Declaration (no initialization)
void printConst() {
    std::cout << "myConstVar: " << myConstVar << std::endl;
}
```

# 6. Controlling Visibility in Shared Libraries

`__attribute__((visibility("default")))`: When creating shared libraries, function visibility can be controlled using this attribute on compilers like GCC and Clang. Functions marked with "default" visibility are exported and accessible outside the shared library.

```cpp
__attribute__((visibility("default"))) void exportedFunction() {
    // Visible outside the shared library
}
```

It is common to define a macro that controls function or variable visibility.
```cpp
#define MYEXPORT __attribute__ ((visibility ("default")))
MYEXPORT int add(int a, int b);
```