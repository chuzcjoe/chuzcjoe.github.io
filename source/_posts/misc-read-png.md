---
title: Integrate libpng in C++
author: Joe Chu
date: 2024-06-13 23:07:50
tags: [png]
categories:
- misc
---

Integrate libpng to C++ projects and read external images.

<!-- more -->

If you frequently work on image processing using C++, you likely need to read images from the local disk and apply post-processing to test your algorithms. Many of these images are in PNG format. This tutorial provides a straightforward method to integrate libpng into any C++ project, enabling developers to read PNG images.

# 1. Download and build zlib

libpng depends on zlib.
```
git clone https://github.com/madler/zlib.git
cd zlib
mkdir build
cd build
cmake ..
make
sudo make install
```

# 2. Download and build libpng

```
git clone https://github.com/glennrp/libpng.git
cd libpng
mkdir build
cd build
cmake ..
make
```

# 3. Copy files to project directory

```
.
├── CMakeLists.txt
├── example.png
├── include
│   ├── png.h
│   ├── pngconf.h
│   ├── pnglibconf.h
│   └── zlib.h
├── lib
│   ├── libpng.a
│   └── libz.a
└── main.cpp
```

`main.cpp`
```cpp
#include <iostream>
#include <vector>
#include <png.h>

void read_png_file(const char* file_name, std::vector<unsigned char>& image, unsigned& width, unsigned& height) {
    FILE *fp = fopen(file_name, "rb");
    if (!fp) {
        std::cerr << "Error: Cannot open file " << file_name << std::endl;
        return;
    }

    png_structp png = png_create_read_struct(PNG_LIBPNG_VER_STRING, nullptr, nullptr, nullptr);
    if (!png) {
        std::cerr << "Error: Cannot create png read struct" << std::endl;
        fclose(fp);
        return;
    }

    png_infop info = png_create_info_struct(png);
    if (!info) {
        std::cerr << "Error: Cannot create png info struct" << std::endl;
        png_destroy_read_struct(&png, nullptr, nullptr);
        fclose(fp);
        return;
    }

    if (setjmp(png_jmpbuf(png))) {
        std::cerr << "Error: png jump buffer error" << std::endl;
        png_destroy_read_struct(&png, &info, nullptr);
        fclose(fp);
        return;
    }

    png_init_io(png, fp);
    png_read_info(png, info);

    width = png_get_image_width(png, info);
    height = png_get_image_height(png, info);
    png_byte color_type = png_get_color_type(png, info);
    png_byte bit_depth = png_get_bit_depth(png, info);

    if (bit_depth == 16)
        png_set_strip_16(png);

    if (color_type == PNG_COLOR_TYPE_PALETTE)
        png_set_palette_to_rgb(png);

    if (color_type == PNG_COLOR_TYPE_GRAY && bit_depth < 8)
        png_set_expand_gray_1_2_4_to_8(png);

    if (png_get_valid(png, info, PNG_INFO_tRNS))
        png_set_tRNS_to_alpha(png);

    if (color_type == PNG_COLOR_TYPE_RGB || color_type == PNG_COLOR_TYPE_GRAY || color_type == PNG_COLOR_TYPE_PALETTE)
        png_set_filler(png, 0xFF, PNG_FILLER_AFTER);

    if (color_type == PNG_COLOR_TYPE_GRAY || color_type == PNG_COLOR_TYPE_GRAY_ALPHA)
        png_set_gray_to_rgb(png);

    png_read_update_info(png, info);

    image.resize(png_get_rowbytes(png, info) * height);
    std::vector<png_bytep> row_pointers(height);

    for (unsigned i = 0; i < height; ++i)
        row_pointers[i] = image.data() + i * png_get_rowbytes(png, info);

    png_read_image(png, row_pointers.data());

    png_destroy_read_struct(&png, &info, nullptr);
    fclose(fp);
}

int main() {
    const char* file_name = "../example.png";
    std::vector<unsigned char> image;
    unsigned width, height;

    read_png_file(file_name, image, width, height);

    std::cout << "Image width: " << width << ", height: " << height << std::endl;

    // Now you can use the 'image' vector which contains the raw pixel data.

    return 0;
}
```

`CMakeLists.txt`
```cmake
cmake_minimum_required(VERSION 3.10)

# Project name
project(ReadPNG)

# Specify the C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Include directories
include_directories(include)

# Add the static libraries
add_library(png STATIC IMPORTED)
set_target_properties(png PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/lib/libpng.a)

add_library(z STATIC IMPORTED)
set_target_properties(z PROPERTIES IMPORTED_LOCATION ${CMAKE_SOURCE_DIR}/lib/libz.a)

# Add the executable
add_executable(read_png main.cpp)

# Link the libraries
target_link_libraries(read_png png z)
```

# 4. Compile and run

```
mkdir build
cd build
cmake ..
make
./read_png
```

```
Image width: 1568, height: 1712
```