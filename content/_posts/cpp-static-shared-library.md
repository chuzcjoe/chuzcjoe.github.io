---
title: Static And Shared Library
author: Joe Chu
date: 2024-06-29 13:11:27
tags: [static library, shared library]
categories:
- cpp
---

Code distribution among different programs and machines.

<!-- more -->

# 1. Introduction

A `static library` is a collection of object files that are linked into the program during the linking phase of compilation, becoming part of the final executable. A `shared library` is a collection of object files that are loaded into the program at runtime. Multiple programs can share the same library code in memory.

# 2. Example

## 2.1 Implementation

Source code can be found at: https://github.com/chuzcjoe/static_shared_lib

Project structure
```
.
├── CMakeLists.txt
├── README.md
├── main.cpp
└── math
    ├── CMakeLists.txt
    ├── mathlib.cpp
    └── mathlib.h
```

We have a simple math library that does simple math operations.

```cpp
// mathlib.h
#pragma once

class MathLib {
public:
    MathLib();
    ~MathLib();

    double add(double, double);
    double subtract(double, double);
    double multiply(double, double);
    double divide(double, double);
};

// mathlib.cpp
#include "mathlib.h"
#include <iostream>

double MathLib::add(double a, double b) {
    return a + b;
}

double MathLib::subtract(double a, double b) {
    return a - b;
}

double MathLib::multiply(double a, double b) {
    return a * b;
}

double MathLib::divide(double a, double b) {
    if (b == 0) {
        throw std::domain_error("Division by zero.");
    }
    return a / b;
}

MathLib::MathLib() {}
MathLib::~MathLib() {}
```

We will compile it into both static and shared libraries.
```cmake
cmake_minimum_required(VERSION 3.5.0)

project(Math VERSION 0.0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Create a shared library
add_library(math_shared SHARED mathlib.cpp)
# Create a static library
add_library(math_static STATIC mathlib.cpp)
```

For the most outside CMakeLists.txt, we will generate different executables that link to static/shared libraries.
```cmake
cmake_minimum_required(VERSION 3.5.0)

project(main VERSION 0.0.1 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_subdirectory(${CMAKE_SOURCE_DIR}/math)

# add an executable that links to a shared library
add_executable(main_shared main.cpp)
target_include_directories(main_shared PRIVATE ${CMAKE_SOURCE_DIR}/math)
target_link_libraries(main_shared PRIVATE math_shared)

# add an executable that links to a static library
add_executable(main_static main.cpp)
target_include_directories(main_static PRIVATE ${CMAKE_SOURCE_DIR}/math)
target_link_libraries(main_static PRIVATE math_static)
```

## 2.2 Build

Let's build it.
```bash
mkdir build
cd build
cmake ..
make
```

In the build folder, we can get two executables and inside the math folder, we have generated static/shared libraries. They should have the same output.
```
├── main_shared
├── main_static
└── math
    ├── CMakeFiles
    ├── Makefile
    ├── cmake_install.cmake
    ├── libmath_shared.dylib
    └── libmath_static.a
```

```
> ./main_static
input x and y: 10, 5
Addition: 15
Subtraction: 5
Multiplication: 50
Division: 2

> ./main_shared 
input x and y: 10, 5
Addition: 15
Subtraction: 5
Multiplication: 50
Division: 2
```

## 2.3 Inspect

We could use `otool` on MacOS to check the dependencies of each executable. Or on Linux we could use `ldd`.

```
> otool -L main_static 
main_static:
	/usr/lib/libc++.1.dylib (compatibility version 1.0.0, current version 1500.65.0)
	/usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1319.100.3)
```

```
> otool -L main_shared 
main_shared:
	@rpath/libmath_shared.dylib (compatibility version 0.0.0, current version 0.0.0)
	/usr/lib/libc++.1.dylib (compatibility version 1.0.0, current version 1500.65.0)
	/usr/lib/libSystem.B.dylib (compatibility version 1.0.0, current version 1319.100.3)
```

Because static libraries will become part of the executable, so `libmath_static.a` is not a dependency. On the other hand, shared libraries are loaded during runtime, so `main_shared` replies on `libmath_shared.dylib`.

## 2.4 File size

Linking a static library involves incorporating the entire library into the final executable. Compared with linking shared library, executables that link to static library usually will have larger file size.

```
> ls -lh main_static 
-rwxr-xr-x  1 zongchengchu  staff    40K Jun 29 13:55 main_static
> ls -lh main_shared 
-rwxr-xr-x  1 zongchengchu  staff    39K Jun 29 13:55 main_shared
```

## 2.5 Delete dependencies

If we delete both `libmath_static.a` and `libmath_shared.dylib`, `main_static` can still run without any issues.
```
> ./main_static 
input x and y: 10, 5
Addition: 15
Subtraction: 5
Multiplication: 50
Division: 2
```

However, `main_shared` needs to load `libmath_shared.dylib` at runtime, and it looks for the library at current project as well as system paths. If this library is not found, then we will get a link error.
```
> ./main_shared 
dyld[55250]: Library not loaded: @rpath/libmath_shared.dylib
  Referenced from: <4F8039F2-AFFB-303C-999C-FAF867191A7C> /Users/zongchengchu/Documents/repos/static_shared_lib/build/main_shared
  Reason: tried: '/Users/zongchengchu/Documents/repos/static_shared_lib/build/math/libmath_shared.dylib' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/Users/zongchengchu/Documents/repos/static_shared_lib/build/math/libmath_shared.dylib' (no such file), '/Users/zongchengchu/Documents/repos/static_shared_lib/build/math/libmath_shared.dylib' (no such file), '/System/Volumes/Preboot/Cryptexes/OS/Users/zongchengchu/Documents/repos/static_shared_lib/build/math/libmath_shared.dylib' (no such file), '/usr/local/lib/libmath_shared.dylib' (no such file), '/usr/lib/libmath_shared.dylib' (no such file, not in dyld cache)
```

## 2.5 More

If a static/shared library depends on another library. The relationship can be:
| dependencies | valid? |
|---|---|
| shared_lib links to static_lib | &cross; |
| shared_lib links to shared_lib | &check; |
| static_lib links to static_lib | &check; |
| static_lib links to shared_lib | &check; |

Shared libraries can only be linked to shared libraries. Static libraries can be linked to both shared and static library.

# 3. Conclusion

**static library**
- <span style="color:green;">Advantages:</span>
    - Simplicity: No external dependencies are required at runtime.
    - Performance: Sometimes faster to start and run due to the absence of the need to resolve symbols or load additional libraries at runtime.

- <span style="color:red;">Disadvantages:</span>
    - File Size: Can lead to larger executable sizes because each program has its own copy of the library.
    - Updates: If the library is updated, all applications using it must be recompiled and redeployed to benefit from the updates.

**shared library**
- <span style="color:green;">Advantages:</span>
    - Reduced Memory Usage: Since the library is shared in memory among multiple programs, it can reduce memory usage overall.
    - Ease of Updating: Updating a shared library can provide immediate benefits to all programs that use it, without needing recompilation.

- <span style="color:red;">Disadvantages:</span>
    - Complexity: Requires careful management of versions and dependencies to ensure compatibility.
    - Startup Time: Can have slower startup times as the operating system needs to link the external libraries dynamically when the program is launched.



void GLRender::nextImage() {
    LOG_INFO("switch to next image.");
    int next_index = (image_idx + 1) % IMAGE_NUM;
    sdrImage.setFilepath(files[next_index]);

    glBindTexture(GL_TEXTURE_2D, 0);
    glBindTexture(GL_TEXTURE_2D, _texture);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);

    sdrImage.loadJPEG();
    auto data = sdrImage.data();
    int width = sdrImage.getWidth();
    int height = sdrImage.getHeight();

    if (data) {
        // generate texture
        glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, width, height, 0, GL_RGB, GL_UNSIGNED_BYTE, data);
        glGenerateMipmap(GL_TEXTURE_2D);
        LOG_INFO("load texture success, width: %d, height: %d\n", width, height);

    } else {
        LOG_ERROR("load texture error");
    }

    glUseProgram(tProgram);
    glUniform1i(glGetUniformLocation(tProgram, "texture_load"), 0);
}