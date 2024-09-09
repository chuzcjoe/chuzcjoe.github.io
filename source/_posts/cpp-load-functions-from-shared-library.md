---
title: Load Functions from Shared Libraries
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
date: 2024-09-08 14:04:36
tags:
categories:
---

Loading the partial shared library can be beneficial for two reasons:
1. Original shared library can be very large sometimes(100+ Mb).
2. Original shared library is not accessible until runtime(OEM specific libraries such OpenCL).

<!-- more -->

# 1. Demo

We will start with a customized demo example to illustrate how to load partial shared library at runtime.

We will generate a simplified math library containing basic algorithmic operations(add, subtract, multiply and divide). `test.cpp` will load these functions **at runtime**.

## 1.1 Code
```
.
├── mathOP.cpp
├── mathOP.h
└── test.cpp
```

```cpp
// mathOP.h
#ifndef MATH_OPERATIONS_H
#define MATH_OPERATIONS_H

extern "C" {
    double add(double a, double b);
    double subtract(double a, double b);
    double multiply(double a, double b);
    double divide(double a, double b);
}

#endif // MATH_OPERATIONS_H
```

```cpp
// math.cpp
#include <cmath>

extern "C" {
    double add(double a, double b) {
        return a + b;
    }

    double subtract(double a, double b) {
        return a - b;
    }

    double multiply(double a, double b) {
        return a * b;
    }

    double divide(double a, double b) {
        if (b != 0) {
            return a / b;
        }
        return INFINITY;
    }
}
```

```cpp
// test.cpp
#include <iostream>
#include <dlfcn.h>
#include "mathOP.h"

int main() {
    void* handle = dlopen("./mathOP.so", RTLD_LAZY);

    if (!handle) {
        std::cerr << "Cannot open library: " << dlerror() << '\n';
        return 1;
    }

    // Load the functions
    double (*add)(double, double) = (double (*)(double, double)) dlsym(handle, "add");
    double (*subtract)(double, double) = (double (*)(double, double)) dlsym(handle, "subtract");
    double (*multiply)(double, double) = (double (*)(double, double)) dlsym(handle, "multiply");
    double (*divide)(double, double) = (double (*)(double, double)) dlsym(handle, "divide");

    if (!add || !subtract || !multiply || !divide) {
        std::cerr << "Cannot load functions: " << dlerror() << '\n';
        dlclose(handle);
        return 1;
    }

    // Use the functions
    std::cout << "5 + 3 = " << add(5, 3) << '\n';
    std::cout << "5 - 3 = " << subtract(5, 3) << '\n';
    std::cout << "5 * 3 = " << multiply(5, 3) << '\n';
    std::cout << "5 / 3 = " << divide(5, 3) << '\n';

    dlclose(handle);
    return 0;
}
```

## 1.2 Compile and Run
```
g++ -fPIC -shared -o mathOP.so mathOP.cpp
```

```
g++ -o test test.cpp -ldl
```

```
./test

output:
5 + 3 = 8
5 - 3 = 2
5 * 3 = 15
5 / 3 = 1.66667
```

# 2. Practice on libJpeg

If you're using a Mac with Apple silicon, you can follow my tutorial step by step to reproduce the results. For other operating systems, like Linux or Windows, the process is generally similar, but you may need to do some research and make a few adjustments.

To install jpeg library:
```
brew install libjpeg
```
You should be able to see the installed location in your terminal message. For example, mine is:
```
If you need to have jpeg first in your PATH, run:
  echo 'export PATH="/opt/homebrew/opt/jpeg/bin:$PATH"' >> ~/.zshrc

For compilers to find jpeg you may need to set:
  export LDFLAGS="-L/opt/homebrew/opt/jpeg/lib"
  export CPPFLAGS="-I/opt/homebrew/opt/jpeg/include"
```

Let's write a C++ program to read a jpeg format image. In our program, we only load needed functions to read an image.
```c++
#include <iostream>
#include <dlfcn.h>
#include <cstdio>
#include <jpeglib.h>

// Function pointer types using modern C++ syntax
using jpeg_std_error_type = struct jpeg_error_mgr* (*)(struct jpeg_error_mgr* err);
using jpeg_CreateDecompress_type = void (*)(j_decompress_ptr cinfo, int version, size_t structsize);
using jpeg_destroy_decompress_type = void (*)(j_decompress_ptr cinfo);
using jpeg_read_header_type = int (*)(j_decompress_ptr cinfo, boolean require_image);
using jpeg_start_decompress_type = boolean (*)(j_decompress_ptr cinfo);
using jpeg_abort_decompress_type = void (*)(j_decompress_ptr cinfo);
using jpeg_stdio_src_type = void (*)(j_decompress_ptr cinfo, FILE* infile);

int main(int argc, char* argv[]) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " <JPEG file>" << std::endl;
        return 1;
    }

    // Open the shared library
    void* handle = dlopen("/opt/homebrew/opt/jpeg/lib/libjpeg.dylib", RTLD_LAZY);
    if (!handle) {
        // Try an alternative path if the first one fails
        handle = dlopen("./libjpeg.dylib", RTLD_LAZY);
        if (!handle) {
            std::cerr << "Cannot open library: " << dlerror() << std::endl;
            return 1;
        }
    }

    // Load the functions
    auto jpeg_std_error = reinterpret_cast<jpeg_std_error_type>(dlsym(handle, "jpeg_std_error"));
    auto jpeg_CreateDecompress = reinterpret_cast<jpeg_CreateDecompress_type>(dlsym(handle, "jpeg_CreateDecompress"));
    auto jpeg_destroy_decompress = reinterpret_cast<jpeg_destroy_decompress_type>(dlsym(handle, "jpeg_destroy_decompress"));
    auto jpeg_read_header = reinterpret_cast<jpeg_read_header_type>(dlsym(handle, "jpeg_read_header"));
    auto jpeg_start_decompress = reinterpret_cast<jpeg_start_decompress_type>(dlsym(handle, "jpeg_start_decompress"));
    auto jpeg_abort_decompress = reinterpret_cast<jpeg_abort_decompress_type>(dlsym(handle, "jpeg_abort_decompress"));
    auto jpeg_stdio_src = reinterpret_cast<jpeg_stdio_src_type>(dlsym(handle, "jpeg_stdio_src"));

    if (!jpeg_std_error || !jpeg_CreateDecompress || !jpeg_destroy_decompress || 
        !jpeg_read_header || !jpeg_start_decompress || !jpeg_abort_decompress || !jpeg_stdio_src) {
        std::cerr << "Cannot load function: " << dlerror() << std::endl;
        dlclose(handle);
        return 1;
    }

    // Open the JPEG file
    FILE* infile = fopen(argv[1], "rb");
    if (!infile) {
        std::cerr << "Can't open " << argv[1] << std::endl;
        dlclose(handle);
        return 1;
    }

    // Set up the JPEG decompression object
    struct jpeg_decompress_struct cinfo;
    struct jpeg_error_mgr jerr;

    cinfo.err = jpeg_std_error(&jerr);
    jpeg_CreateDecompress(&cinfo, JPEG_LIB_VERSION, sizeof(struct jpeg_decompress_struct));

    // Specify the source file
    jpeg_stdio_src(&cinfo, infile);

    // Read the JPEG header
    jpeg_read_header(&cinfo, TRUE);

    // Start decompression
    jpeg_start_decompress(&cinfo);

    // Print image information
    std::cout << "Image Width: " << cinfo.output_width << std::endl;
    std::cout << "Image Height: " << cinfo.output_height << std::endl;
    std::cout << "Color Components: " << cinfo.output_components << std::endl;
    std::cout << "Color Space: " << cinfo.out_color_space << std::endl;

    // Clean up
    jpeg_abort_decompress(&cinfo);
    jpeg_destroy_decompress(&cinfo);
    fclose(infile);
    dlclose(handle);

    return 0;
}
```

To compile and run:

```
g++ -o test test.cpp -I/opt/homebrew/opt/jpeg/include -std=c++11
./test img.jpg

output:
Image Width: 4000
Image Height: 6000
Color Components: 3
Color Space: 2
```