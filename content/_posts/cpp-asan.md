---
title: Runtime Memory Error Detection Using ASAN
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/baby.png
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
    index: null
    collapsed: true
    depth: 3
  - position: left
    type: adsense
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2025-09-10 21:00:19
tags: [asan, memory]
categories:
- cpp
---

AddressSanitizer (ASan) is a runtime memory error detector built into LLVM/Clang and GCC.

<!-- more -->

# 1. Enable ASAN

ASAN instruments your program at compile time and inserts checks into the generated binary. When you run the program, ASan monitors all memory accesses to catch bugs that normally lead to undefined behavior.

Illegal memory access will cause random segmentation fault and most of such memory accesses can be detected by ASAN.

In CMake, add a simple helper function to enable ASAN for libs/executables
```cmake
function(enable_asan target)
    if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU" OR 
       CMAKE_CXX_COMPILER_ID STREQUAL "Clang" OR 
       CMAKE_CXX_COMPILER_ID STREQUAL "AppleClang")
        target_compile_options(${target} PRIVATE -g -O1 -fsanitize=address -fno-omit-frame-pointer)
        target_link_options(${target} PRIVATE -fsanitize=address)
        target_compile_definitions(${target} PRIVATE ASAN_ENABLED=1)
        message(STATUS "AddressSanitizer enabled for target: ${target}")
    else()
        message(WARNING "AddressSanitizer is not supported for ${CMAKE_CXX_COMPILER_ID}")
    endif()
endfunction()
```

# 2. Out of Bound Memory Access

Let's add some illegal memory access code. In this demo, there are two places where illegal memory access will occur.
1. In `lib_math.cpp`, `a[i - 1]` tries to access the memory address before the first element.
2. In `main.cpp`, we are trying to access `vec1[-1]`.

```cpp
// lib_math.cpp
namespace math_lib {
    std::vector<double> add(const std::vector<double>& a, const std::vector<double>& b) {
        if (a.size() != b.size()) {
            throw std::invalid_argument("Vectors must have the same size for addition");
        }
        
        std::vector<double> result(a.size());
        for (size_t i = 0; i < a.size(); ++i) {
            result[i] = a[i - 1] + b[i];
        }
        return result;
    }
}
```

```cpp
// main.cpp

int main() {
    // Create some test vectors
    std::vector<double> vec1 = {1.0, 2.0, 3.0};
    std::vector<double> vec2 = {4.0, 5.0, 6.0};

    const auto result = math_lib::add(vec1, vec2);
    
    std::cout << vec1[-1] << std::endl;
     
    return 0;
}
```

Let's see if ASAN can detect these two errors. We need to enable ASAN for both math lib and our main executable.

```cmake
cmake_minimum_required(VERSION 3.28)
project(ASAN_DEMO)

# Set C++ standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Function to enable AddressSanitizer
function(enable_asan target)
    if(CMAKE_CXX_COMPILER_ID STREQUAL "GNU" OR 
       CMAKE_CXX_COMPILER_ID STREQUAL "Clang" OR 
       CMAKE_CXX_COMPILER_ID STREQUAL "AppleClang")
        target_compile_options(${target} PRIVATE -g -O1 -fsanitize=address -fno-omit-frame-pointer)
        target_link_options(${target} PRIVATE -fsanitize=address)
        target_compile_definitions(${target} PRIVATE ASAN_ENABLED=1)
        message(STATUS "AddressSanitizer enabled for target: ${target}")
    else()
        message(WARNING "AddressSanitizer is not supported for ${CMAKE_CXX_COMPILER_ID}")
    endif()
endfunction()

# Create the math library
add_library(math_lib STATIC src/math_lib.cpp)
target_include_directories(math_lib PUBLIC include)
enable_asan(math_lib)

# Create the executable
add_executable(demo main.cpp)
enable_asan(demo)

# Link the math library to the executable
target_link_libraries(demo math_lib)
```

Let's try to run the demo.
```
./build/demo
```

```
=================================================================
==57371==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x000103001e38 at pc 0x000100353568 bp 0x00016faaee70 sp 0x00016faaee68
READ of size 8 at 0x000103001e38 thread T0
    #0 0x100353564 in math_lib::add(std::__1::vector<double, std::__1::allocator<double>> const&, std::__1::vector<double, std::__1::allocator<double>> const&) math_lib.cpp:13
    #1 0x1003526e8 in main main.cpp:10
    #2 0x18a8360dc  (<unknown module>)

0x000103001e38 is located 8 bytes to the left of 24-byte region [0x000103001e40,0x000103001e58)
allocated by thread T0 here:
    #0 0x100b45370 in wrap__Znwm+0x74 (libclang_rt.asan_osx_dynamic.dylib:arm64e+0x51370) (BuildId: f0a7ac5c49bc3abc851181b6f92b308a32000000200000000100000000000b00)
    #1 0x10035253c in main main.cpp:7
    #2 0x18a8360dc  (<unknown module>)

SUMMARY: AddressSanitizer: heap-buffer-overflow math_lib.cpp:13 in math_lib::add(std::__1::vector<double, std::__1::allocator<double>> const&, std::__1::vector<double, std::__1::allocator<double>> const&)
Shadow bytes around the buggy address:
  0x007020620370: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x007020620380: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x007020620390: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x0070206203a0: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x0070206203b0: fa fa fa fa fa fa fa fa fa fa fa fa 00 00 00 fa
=>0x0070206203c0: fa fa 00 00 00 fa fa[fa]00 00 00 fa fa fa 00 00
  0x0070206203d0: 00 00 fa fa 00 00 00 00 fa fa 00 00 04 fa fa fa
  0x0070206203e0: 00 00 00 00 fa fa 00 00 00 00 fa fa 00 00 00 00
  0x0070206203f0: fa fa 00 00 00 00 fa fa 00 00 00 00 fa fa 00 00
  0x007020620400: 00 00 fa fa 00 00 00 00 fa fa 00 00 00 00 fa fa
  0x007020620410: 00 00 00 00 fa fa 00 00 00 00 fa fa 00 00 00 00
Shadow byte legend (one shadow byte represents 8 application bytes):
  Addressable:           00
  Partially addressable: 01 02 03 04 05 06 07 
  Heap left redzone:       fa
  Freed heap region:       fd
  Stack left redzone:      f1
  Stack mid redzone:       f2
  Stack right redzone:     f3
  Stack after return:      f5
  Stack use after scope:   f8
  Global redzone:          f9
  Global init order:       f6
  Poisoned by user:        f7
  Container overflow:      fc
  Array cookie:            ac
  Intra object redzone:    bb
  ASan internal:           fe
  Left alloca redzone:     ca
  Right alloca redzone:    cb
==57371==ABORTING
[1]    57371 abort      ./build/demo
```
ASAN successfully detects the error in `lib_math.cpp`, and it explicitly identifies the line of code where the problem occurs. The full call stack is also shown here. ASAN will abort once illegal memory access is detected, so we won't see the second memory error. Let's fix the first one and run the demo again.

```
=================================================================
==57961==ERROR: AddressSanitizer: heap-buffer-overflow on address 0x000107201e38 at pc 0x000104553974 bp 0x00016b8aefd0 sp 0x00016b8aefc8
READ of size 8 at 0x000107201e38 thread T0
    #0 0x104553970 in main main.cpp:12
    #1 0x18a8360dc  (<unknown module>)

0x000107201e38 is located 8 bytes to the left of 24-byte region [0x000107201e40,0x000107201e58)
allocated by thread T0 here:
    #0 0x104d45370 in wrap__Znwm+0x74 (libclang_rt.asan_osx_dynamic.dylib:arm64e+0x51370) (BuildId: f0a7ac5c49bc3abc851181b6f92b308a32000000200000000100000000000b00)
    #1 0x1045534e0 in main main.cpp:7
    #2 0x18a8360dc  (<unknown module>)

SUMMARY: AddressSanitizer: heap-buffer-overflow main.cpp:12 in main
Shadow bytes around the buggy address:
  0x007020e60370: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x007020e60380: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x007020e60390: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x007020e603a0: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
  0x007020e603b0: fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa fa
=>0x007020e603c0: fa fa 00 00 00 fa fa[fa]00 00 00 fa fa fa 00 00
  0x007020e603d0: 00 00 fa fa 00 00 00 00 fa fa 00 00 04 fa fa fa
  0x007020e603e0: 00 00 00 00 fa fa 00 00 00 00 fa fa 00 00 00 00
  0x007020e603f0: fa fa 00 00 00 00 fa fa 00 00 00 00 fa fa 00 00
  0x007020e60400: 00 00 fa fa 00 00 00 00 fa fa 00 00 00 00 fa fa
  0x007020e60410: 00 00 00 00 fa fa 00 00 00 00 fa fa 00 00 00 00
Shadow byte legend (one shadow byte represents 8 application bytes):
  Addressable:           00
  Partially addressable: 01 02 03 04 05 06 07 
  Heap left redzone:       fa
  Freed heap region:       fd
  Stack left redzone:      f1
  Stack mid redzone:       f2
  Stack right redzone:     f3
  Stack after return:      f5
  Stack use after scope:   f8
  Global redzone:          f9
  Global init order:       f6
  Poisoned by user:        f7
  Container overflow:      fc
  Array cookie:            ac
  Intra object redzone:    bb
  ASan internal:           fe
  Left alloca redzone:     ca
  Right alloca redzone:    cb
==57961==ABORTING
[1]    57961 abort      ./build/demo
```
`vec1[-1]` is again being detected by ASAN. And the error message explicitly tells us that we are trying to access the memory (0x000107201e38) which is located 8 bytes to the left of 24-byte region \[0x000107201e40,0x000107201e58\]

# 3. Segmentation Fault

While an illegal memory access may cause a segmentation fault, this isn’t guaranteed; if the access still points to an address inside the system-assigned memory space for the program, it might not crash right away.

Let's turn off the ASAN and run the modified `main.cpp`.
```cpp
// main.cpp
int main() {
    // Create some test vectors
    std::vector<double> vec1 = {1.0, 2.0, 3.0};

    std::cout << vec1[-10] << std::endl;
    std::cout << vec1[-100] << std::endl;
    std::cout << vec1[-1000] << std::endl;
    std::cout << vec1[-10000] << std::endl;

    return 0;
}
```

```
0
0
0
[1]    58569 segmentation fault  ./build/demo
```

# 4. llvm-addr2line Tool

If your program runs on Android, enabling ASan won’t give you the same straightforward error messages you’d see on macOS. The output usually contains just the executable or library name along with a memory address, without pointing to the specific line of code. In this situation, you can use a tool like `llvm-addr2line` to translate those addresses into the corresponding source locations.

`llvm-addr2line` is located inside Android NDK. For example, it is located at: `Android/sdk/ndk/26.1.10909125/toolchains/llvm/prebuilt/darwin-x86_64/bin` in my local path.

The basic usage is:
```bash
llvm-addr2line -e ./demo -f -C -i -p [address_from_asan_message]
```

This should translate your ASAN reported error addresses to the corresponding source code.