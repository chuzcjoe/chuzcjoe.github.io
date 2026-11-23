---
title: When Smart Pointer Meets Const and Reference
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
date: 2026-09-17 21:20:54
tags: [cpp, smart pointer]
categories:
- cpp
---

const std::shared_ptr\<T\>& vs const std::shared_ptr\<T\>

<!-- more -->

# 1. Differences and Commons

Let's first talk about `const std::shared_ptr<T>&`. This means a **const reference to a shared_ptr**. 
- There is no copy of the `shared_ptr` itself, so the reference count will not change.
- **const** only applies to the `shared_ptr`, so the underlying data can be modified.

```cpp
void Foo(const std::shared_ptr<T>& engine) {
    engine->Run();       // OK

    // engine.reset();   // Error
    // engine = nullptr; // Error

    engine->SetValue(1); // OK
}
```

Next, we have `const std::shared_ptr<T>`. `shared_ptr` is passed by value.
- The reference count will change.
- Same as above, **const** only applies to the `shared_ptr`, so the underlying data can be modified.

```cpp
void Foo(const std::shared_ptr<T> engine) {
    engine->Run();       // OK

    // engine.reset();   // Error
    // engine = nullptr; // Error

    engine->SetValue(1); // OK
}
```

So, the short conclusion
| Parameter | Copies `shared_ptr`? | Ref count change | Can modify pointer? | Can modify object? |
| --- | --- | --- | --- | --- |
| `const std::shared_ptr<T>&` | No | No | No | Yes |
| `const std::shared_ptr<T>` | Yes | Yes | No | Yes |

# 2. When to Use

How and when to use these two forms is mostly determined by ownership semantics. In many cases, `const std::shared_ptr<T>&` is preferred when the function only needs to use the **shared_ptr** during the call and does not need to acquire or retain shared ownership. It is also slightly more efficient because passing by **const reference** avoids copying the shared_ptr and therefore normally avoids incrementing and decrementing its reference count.