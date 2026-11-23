---
title: Google C++ Style Quick Reference
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
date: 2025-07-27 21:07:26
tags: [cpp style]
categories:
- cpp
---

A concise summary of essential Google C++ style guidelines to elevate your code quality.

<!-- more -->

https://google.github.io/styleguide/cppguide.html

# 1. Naming Conventions

| Type                                    | Convention                                 | Example                               |
| --------------------------------------- | ------------------------------------------ | ------------------------------------- |
| **Namespaces**                          | `snake_case`                               | `namespace image_processing`          |
| **Class/Struct/Enum/Type Names**        | `CamelCase`                                | `class AudioEncoder`                  |
| **Public Functions**                    | `CamelCase`                                | `void ComputeValue()`                 |
| **Private/Protected Functions**         | `CamelCase` (same as public)               | `void UpdateInternalState()`          |
| **Local Variables**                     | `snake_case`                               | `int local_count;`                    |
| **Public Member Variables** *(if used)* | `snake_case`                               | `int frame_count;`                    |
| **Private/Protected Member Variables**  | `snake_case_` *(with trailing underscore)* | `int buffer_size_;`                   |
| **Static Member Variables**             | `snake_case_` *(with trailing underscore)* | `static int instance_count_;`         |
| **Constants (`constexpr`, `const`)**    | `kCamelCase`                               | `const int kMaxWidth = 800;`          |
| **Macros**                              | `ALL_CAPS_WITH_UNDERSCORES`                | `#define BUFFER_SIZE 256`             |
| **Enumerators (enum values)**           | `kCamelCase`                               | `enum Color { kRed, kGreen, kBlue };` |
| **Template Parameters**                 | `CamelCase`                                | `template <typename InputIterator>`   |
| **Files**                               | `snake_case.h` / `snake_case.cc`           | `audio_encoder.h`, `audio_encoder.cc` |

# 2. Formatting

1. Only use spaces(no tab). Use 2 spaces at a time.
2. Maximum of 80 characters for each line.
3. Pointers and references: `int* p` and `int& r`.

Formatting could be easily resolved using `clang-format`. Create a `.clang-format` file in your project's root directory.
```yaml
BasedOnStyle: Google
IndentWidth: 2
ColumnLimit: 80
```

And run the following command line to apply the format.
```
clang-format -i file1.cpp
```

# 3. Include Files

1. Orders: Related header -> C system headers -> C++ standard library headers -> other libraries' headers -> your project's headers.
2. All project's header files need to be listed as descendants of the project's source directory. No `.` or `..`.

```cpp
#include "example_encoder.h"       // Related header

#include <sys/types.h>             // C system headers
#include <unistd.h>

#include <algorithm>               // C++ standard library headers
#include <vector>

#include "third_party/libx/libx.h" // Other libraries' headers
#include "third_party/liby/liby.h"

#include "media/base/audio_frame.h" // Your project's headers
#include "media/base/buffer_pool.h"
```

# 4. Classes and Structs

1. Use a struct only for passive objects that carry data; everything else is a class.
2. Explicitly declare constructors as `explicit` if they take a single argument.

# 5. Const Correctness

Mark member functions as `const` if they do not modify object state.

# 6. Lambda Expressions

Prefer explicit capture over `[=]` or `[&]` to avoid accidental capture.

# 7. Defining Functions in Headers

Functions defined at the point of declaration are `inline` by default.

Based on the [guide](https://google.github.io/styleguide/cppguide.html#Defining_Functions_in_Header_Files:~:text=in%20another%20project.-,Defining%20Functions%20in%20Header%20Files,-Include%20the%20definition), there are PROs and CONs doing that. The rule is: the definition has 10 lines or fewer.

# Adding More
