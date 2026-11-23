---
title: Most Vexing Parse
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/me.jpeg
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
date: 2025-02-25 21:17:32
tags: [cpp]
categories:
- cpp
---

The term "most vexing parse" was first used by Scott Meyers in his 2001 book Effective STL.

<!-- more -->

# 1. Introduction

The "most vexing parse" is a famous ambiguity in C++ syntax. It occurs when the compiler interprets a statement as function declaration instead of an object construction.

```cpp
#include <iostream>

struct MyClass {
    MyClass() { std::cout << "Constructor called!\n"; }
};

int main() {
    MyClass obj();  // This looks like it creates an object, but it is not.
    return 0;
}
```

Some compilers provide warnings that can help catch potential most vexing parse issues using `-Wvexing-parse`. The above code will generate compile warnings if this option is enabled.

```
<source>:8:16: warning: empty parentheses interpreted as a function declaration [-Wvexing-parse]
    MyClass obj();
               ^~
<source>:8:16: note: remove parentheses to declare a variable
    MyClass obj();
```

C++ grammar allows declarations to look very similar to expressions. When the compiler encounters `MyClass obj();`, it prioritizes interpreting it as a declaration (because declarations are more fundamental in the language’s parsing rules) rather than an expression creating an object.

Another common example when using `std::vector`
```cpp
std::vector<int> v(10, 20); // Correct: Creates a vector with 10 elements of value 20
std::vector<int> v2();  // Most Vexing Parse! Declares a function v2 returning a vector<int>
```

# 2. How to fix?

```cpp
MyClass obj{}; // Use uniform initialization with braces (C++11 and later):
MyClass obj;
MyClass obj = MyClass();
MyClass* obj = new MyClass();
```

# References
- https://en.wikipedia.org/wiki/Most_vexing_parse
