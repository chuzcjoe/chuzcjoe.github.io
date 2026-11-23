---
title: Keep Track of Commit id in Code Development
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
date: 2025-04-01 21:18:51
tags: [commit id]
categories:
- cpp
---

Obtaining the current Git commit ID in C++ code serves several purposes, mainly for debugging, version tracking, and reproducibility.

<!-- more -->

# 1. Importance

Here are some common reasons.

## 1.1 Version Identification

1. Embedding the commit ID allows you to track exactly which version of the code was used in a given build. 
2. Useful in applications where users report issues, so developers can quickly identify the codebase version.

## 1.2 Reproducibility and Debugging

1. When debugging issues, knowing the exact commit helps developers check out the same version and reproduce bugs.
2. If a crash report or log includes the commit ID, developers can match it to the corresponding source code.

## 1.3 CI/CD

1. Including the commit ID in the build helps with tracking which commit was deployed.
2. This is essential in automated deployment pipelines.


# 2. The Most Common Practice

We can embed the commit ID into the C++ program at compile time by using `git rev-parse --short HEAD`. We can achieve that by adding the following to our `CMakeLists.txt` to extract the Git commit ID and define it as a macro.

```cmake
# Get the current Git commit ID
execute_process(
    COMMAND git rev-parse --short HEAD
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE GIT_COMMIT_ID
    OUTPUT_STRIP_TRAILING_WHITESPACE
)

# Define the commit ID as a preprocessor macro
add_definitions(-DGIT_COMMIT_ID="${GIT_COMMIT_ID}")
```

And then we can use the macro in C++ code.
```cpp
#include <iostream>

#ifndef GIT_COMMIT_ID
#define GIT_COMMIT_ID "unknown"
#endif

int main() {
    std::cout << "Current Git Commit ID: " << GIT_COMMIT_ID << std::endl;
    return 0;
}
```

Here is the complete `CMakeLists.txt` file.
```cmake
# Minimum CMake version required
cmake_minimum_required(VERSION 3.10)

# Project name
project(GitCommitExample VERSION 1.0)

# Set C++ standard
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Get the current Git commit ID
execute_process(
    COMMAND git rev-parse --short HEAD
    WORKING_DIRECTORY ${CMAKE_SOURCE_DIR}
    OUTPUT_VARIABLE GIT_COMMIT_ID
    OUTPUT_STRIP_TRAILING_WHITESPACE
    RESULT_VARIABLE GIT_RESULT
)

# Check if the git command succeeded, otherwise set a fallback value
if(NOT GIT_RESULT EQUAL 0)
    set(GIT_COMMIT_ID "unknown")
endif()

# Define the commit ID as a preprocessor macro
add_definitions(-DGIT_COMMIT_ID="${GIT_COMMIT_ID}")

# Add the executable
add_executable(main main.cpp)
``` 