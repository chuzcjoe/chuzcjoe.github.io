---
title: Add GTest to C++ Projects
author: Joe Chu
date: 2024-06-07 15:17:33
tags: [gtest]
categories:
- misc
---

Add GoogleTest framework to any C++ projects using CMake.

<!-- more -->

# 1. Introduction

This tutorial demonstrates the seamless integration of the GoogleTest framework into your pre-existing C++ project to facilitate unit testing. Its user-friendly nature simplifies the process and allows for straightforward inclusion within your CMakeLists.txt for easy compilation.

# 2. Project Structure

For demonstration purpose, we created a simple project.

```
.
├── CMakeLists.txt
├── build
├── googletest
│   ├── BUILD.bazel
│   ├── CMakeLists.txt
│   ├── CONTRIBUTING.md
│   ├── CONTRIBUTORS
│   ├── LICENSE
│   ├── MODULE.bazel
│   ├── README.md
│   ├── WORKSPACE
│   ├── WORKSPACE.bzlmod
│   ├── ci
│   ├── docs
│   ├── fake_fuchsia_sdk.bzl
│   ├── googlemock
│   ├── googletest
│   └── googletest_deps.bzl
├── src
│   ├── main.cpp
│   └── mathop.h
└── tests
    ├── main.cpp
    └── test.cpp
```

`build/`
Generate build files.

`googletest/`
```bash
git clone https://github.com/google/googletest.git
```

`src/mathop.h`
Definitions of some simple math operations.
```cpp
#pragma once

#include <iostream>

template<typename T>
class Math {
public:
    T add(T a, T b) {
        return a + b;
    }

    T subtract(T a, T b) {
        return a - b;
    }

    T multiply(T a, T b) {
        return a * b;
    }

    T divide(T a, T b) {
        if (b == 0) {
            throw std::invalid_argument("Division by zero");
        }
        return a / b;
    }
};
```

`tests/main.cpp`
Entrance for running all the unit test cases.
```cpp
#include "gtest/gtest.h"

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
```

`tests/test.cpp`
Unit test cases.
```cpp
#include <gtest/gtest.h>
#include "mathop.h"


TEST(MathTest, Add) {
    Math<int> math;
    EXPECT_EQ(math.add(3, 4), 7);
    EXPECT_EQ(math.add(-1, -1), -2);
}


TEST(MathTest, Subtract) {
    Math<int> math;
    EXPECT_EQ(math.subtract(7, 5), 2);
    EXPECT_EQ(math.subtract(-1, -1), 0);
}

TEST(MathTest, Multiply) {
    Math<int> math;
    EXPECT_EQ(math.multiply(6, 2), 12);
    EXPECT_EQ(math.multiply(-1, -1), 1);
}

TEST(MathTest, Divide) {
    Math<int> math;
    EXPECT_EQ(math.divide(8, 2), 4);
    EXPECT_THROW(math.divide(8, 0), std::invalid_argument);
}
```

`CMakeLists.txt`
```cmake
cmake_minimum_required(VERSION 3.10)
project(gtest_demo)

# Specify the C++ standard
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Add source files
set(SOURCES
    src/main.cpp
)

# Add main executable
add_executable(main ${SOURCES})

# Add GoogleTest
add_subdirectory(googletest)
include_directories(${gtest_SOURCE_DIR}/include ${gtest_SOURCE_DIR})
include_directories(${CMAKE_SOURCE_DIR}/src)

# Add test files
set(TEST_SOURCES
    tests/main.cpp
    tests/test.cpp
)

# Add an executable for tests
add_executable(runTests ${TEST_SOURCES})
target_link_libraries(runTests gtest gtest_main)
```

# 3. Test

```
# Run all test cases
./runTests
```
```
[==========] Running 4 tests from 1 test suite.
[----------] Global test environment set-up.
[----------] 4 tests from MathTest
[ RUN      ] MathTest.Add
[       OK ] MathTest.Add (0 ms)
[ RUN      ] MathTest.Subtract
[       OK ] MathTest.Subtract (0 ms)
[ RUN      ] MathTest.Multiply
[       OK ] MathTest.Multiply (0 ms)
[ RUN      ] MathTest.Divide
[       OK ] MathTest.Divide (0 ms)
[----------] 4 tests from MathTest (0 ms total)

[----------] Global test environment tear-down
[==========] 4 tests from 1 test suite ran. (0 ms total)
[  PASSED  ] 4 tests.
```

```
# Run single test
./runTests --gtest_filter=MathTest.Add
```
```
Note: Google Test filter = MathTest.Add
[==========] Running 1 test from 1 test suite.
[----------] Global test environment set-up.
[----------] 1 test from MathTest
[ RUN      ] MathTest.Add
[       OK ] MathTest.Add (0 ms)
[----------] 1 test from MathTest (0 ms total)

[----------] Global test environment tear-down
[==========] 1 test from 1 test suite ran. (0 ms total)
[  PASSED  ] 1 test.
```