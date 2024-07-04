---
title: extern keyword
author: Joe Chu
date: 2024-06-27 01:52:36
tags: [extern]
categories:
- cpp
widgets:
-
    # Where should the widget be placed, left sidebar or right sidebar
    position: left
    type: profile
    # Author name
    author: Joe Chu
    # Author title
    author_title: I like to keep knowledge and memories visible and readable.
    # Author's current location
    location: Fremont, CA
    # URL or path to the avatar image
    avatar: /img/me.jpeg
    # Whether show the rounded avatar image
    avatar_rounded: false
    # Email address for the Gravatar
    gravatar: 
    # URL or path for the follow button
    follow_link: https://github.com/chuzcjoe
    # Links to be shown on the bottom of the profile widget
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
# Table of contents widget configurations
-
    # Where should the widget be placed, left sidebar or right sidebar
    position: left
    type: toc
    # Whether to show the index of each heading
    index: true
    # Whether to collapse sub-headings when they are out-of-view
    collapsed: true
    # Maximum level of headings to show (1-6)
    depth: 3
# Recommendation links widget configurations
-
    # Where should the widget be placed, left sidebar or right sidebar
    position: left
    type:
    # Names and URLs of the sites
    links:
        Hexo: https://hexo.io
        Bulma: https://bulma.io
# Categories widget configurations
-
    # Where should the widget be placed, left sidebar or right sidebar
    position: left
    type: categories
---

A summary of extern usage.

<!-- more -->

# 1. Introduction

The primary purposes of using extern can be summarized as follows:

- Sharing variables or functions across multiple source files or translation units.
- Preventing name mangling when linking C++ code with C libraries.

# 2. Sharing variables/functions

It is very important to remember that `extern` can only be used for declaration, not definition.

```cpp
// a.cpp
int var = 1;

// main.cpp
#include <iostream>

extern int var;  // Declaration of the variable defined in a.cpp

int main() {
    std::cout << "Shared variable value: " << var << std::endl;
    var = 100;
    std::cout << "Modified shared variable: " << var << std::endl;
    return 0;
}
```

```cpp
// utils.h
#ifndef UTILS_H
#define UTILS_H

extern int add(int a, int b);  // Function declaration

#endif

// utils.cpp
#include "utils.h"

int add(int a, int b) {  // Function definition
    return a + b;
}

// main.cpp
#include <iostream>
#include "utils.h"

int main() {
    std::cout << "5 + 3 = " << add(5, 3) << std::endl;
    return 0;
}
```

```cpp
// constants.h
extern const int MAX_SIZE;  // Declaration

// constants.cpp
const int MAX_SIZE = 100;  // Definition

// main.cpp
#include "constants.h"
#include <iostream>

int main() {
    std::cout << "Max size: " << MAX_SIZE << std::endl;
    return 0;
}
```

# 3. Prevent name mangling

## 3.1 Name mangling in C++

Name mangling in C++ is the process by which the compiler generates unique names for functions, variables, and other symbols to support features such as function overloading, namespaces, and templates.

For example, if we have the following source code.
```cpp
// a.cpp
void foo(int x) {}
void foo(float x) {}
void foo(double x) {}
```

We compile it and check the symbol table. The overloaded `foo` function is appended by different postfix. This is what we call `name mangling`.
```bash
clang++ -c a.cpp -o a.o
nm a.o
```

```
0000000000000020 T __Z3food
0000000000000010 T __Z3foof
0000000000000000 T __Z3fooi
0000000000000000 t ltmp0
0000000000000030 s ltmp1
```

## 3.2 Issues with name mangling

Let's look at a simple example.

```
.
├── function.c
├── function.h
└── main.cpp
```

```cpp
// function.h
void foo(int value);

// function.c
#include "function.h"
#include <stdio.h>

void foo(int value) {
    printf("Value: %d\n", value);
}

// main.cpp
#include "function.h"

int main() {
    foo(3);
    return 0;
}
```

Let's compile the C source file to an object file.
```bash
clang -c function.c -o function.o
```

Then, compile the C++ source file to an object file.
```bash
clang++ -c main.cpp -o main.o
```

Link object files to generate an executable. We will get an error.
```bash
clang++ function.o main.o -o main
```

```
Undefined symbols for architecture arm64:
  "foo(int)", referenced from:
      _main in main.o
     (found _foo in function.o, declaration possibly missing extern "C")
ld: symbol(s) not found for architecture arm64
```

The reason is because, when we include `function.h` in `main.cpp`, the C++ compiler will mangle the function name. When we compile `function.c`, the C compiler will not perform name mangling. So, in `main.cpp`, it can not find the matching symbol name.

```
> nm main.o

                 U __Z3fooi
0000000000000000 T _main
0000000000000000 t ltmp0
0000000000000030 s ltmp1

> nm function.o

0000000000000000 T _foo
                 U _printf
0000000000000038 s l_.str
0000000000000000 t ltmp0
0000000000000038 s ltmp1
0000000000000048 s ltmp2
```

## 3.3 Using extern "C"

To solve this issue, we can introduce extern "C" when declaring functions to ensure that the function names remain consistent across both C and C++ code, enabling proper linkage.

```cpp
// function.h
#ifdef __cplusplus
extern "C" {
#endif

void foo(int value);

#ifdef __cplusplus
}
#endif

// function.c
#include "function.h"
#include <stdio.h>

void foo(int value) {
    printf("Value: %d\n", value);
}

// main.cpp
#include "function.h"

int main() {
    foo(3);
    return 0;
}
```

This time, the function symbol name should keep the same.

```
> nm main.o

                 U _foo
0000000000000000 T _main
0000000000000000 t ltmp0
0000000000000030 s ltmp1
```

We can sucessfully compile objects files and link them to create the executable.

```bash
clang -c function.c -o function.o
clang++ -c main.cpp -o main.o
clang++ main.o function.o -o main
./main
```

```
Value: 3
```

