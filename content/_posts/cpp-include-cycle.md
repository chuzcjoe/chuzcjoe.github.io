---
title: Circular Include in C++
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
date: 2026-01-19 20:48:44
tags: [circular include]
categories:
- cpp
---

A simple mistake as C++ project grows.

<!-- more -->

# 1. Introduction

When a C++ project grows, `#include` mistakes start showing up as:
- error: incomplete type
- “unknown type name”
- “invalid use of incomplete type”
and so on ...

An include cycle happens when headers form a loop:

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cpp/include_cycle/include_cycle.png" title="Image" width="600px" height="600px">
</p>

Once your include graph contains a loop, it becomes very easy to hit problems where a type is referenced before it’s fully defined.

A minimal circular include example:
```cpp
// A.h
#pragma once
#include "B.h"

class A {
public:
    B b;
};

// B.h
#pragma once
#include "A.h"

class B {
public:
    A a;
};
```

# 2. Solution: Forward Declaration

```cpp
// A.h
#pragma once
#include "B.h"

class B; // forward declaration of B

class A {
public:
    B* b;
};

// B.h
#pragma once
#include "A.h"

class A; // forward declaration of A

class B {
public:
    A* a;
};
```

Forward declarations only work when we store the objects as `pointers` or `references`. The following example will fail if we try to store an actual object.

```cpp
// A.h
#pragma once
#include "B.h"

class B; // forward declaration of B

class A {
public:
    B* b;
};

// B.h
#pragma once
#include "A.h"

class A; // forward declaration of A

class B {
public:
    A a;
};

B.h:8:5: error: field ‘a’ has incomplete type ‘A’
    8 |   A a;
```

The **most effective pattern** to avoid include cycles is to:
1. Forward declaration in headers.
2. Includes in cpp files.

```cpp
// A.h
#pragma once

class B;

class A {
    B* b;
};

// A.cpp
#include "A.h"
#include "B.h"

```

# 3. Inline Functions

Even if you forward declare, inline methods in headers can force full includes. The error messages indicate that we are trying to access the mmeber function of class `A`, however type completeness is still missing even with `forward declaration`.

```cpp
// A.h
#pragma once

#include "B.h"

class B;

class A {
  void print() {
    printf("print from A\n");
  }
  B* b;
};

// B.h
#pragma once

#include "A.h"

class A;

class B {
  void print(A* a) {
    a->print();
  }
};

B.h: In member function ‘void B::print(A*)’:
B.h:9:6: error: invalid use of incomplete type ‘class A’
    9 |     a->print();
      |      ^~
B.h:5:7: note: forward declaration of ‘class A’
    5 | class A;
      |       ^

```


