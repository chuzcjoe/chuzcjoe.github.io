---
title: Vtable Hack
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
date: 2025-03-02 22:04:22
tags: [vtable]
categories:
- cpp
---

Exploring vtable internals.

<!-- more -->

# 1. Introduction

In C++, the virtual table (vtable) is an implementation detail used by compilers to support dynamic polymorphism through virtual functions. In one of my previous [blogs](https://chuzcjoe.github.io/cpp/cpp-vtable/), we discussed about how `vptr` and `vtable` work to achieve dynamic polymorphism. In short, each derived object has a hidden virtual table pointer that points to a vtable. Vtable is just an array of function pointers.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cpp/vtable-in-depth/vptr.png" title="Image 1" width="600px" height="500px">
</p>

The C++ standard doesn’t expose the vtable or vptr as part of the language. Its layout and existence depend on the compiler (e.g., GCC, MSVC, Clang) and platform. We can approximate access to the vtable by dereferencing the vptr manually, but this is undefined behavior in strict C++ terms and should only be done for learning or debugging purposes.

**vptr Location**: The vptr is typically the first hidden member of the object (on most compilers like GCC and MSVC), but this isn’t guaranteed by the standard.

**vtable Layout**: The vtable is an array of function pointers. The order corresponds to the declaration order of virtual functions, but again, this is compiler-specific.

# 2. Access Vptr and Vtable

```cpp
#include <iostream>

class Base {
public:
    virtual void func1() { std::cout << "Base::func1\n"; }
    virtual void func2() { std::cout << "Base::func2\n"; }
};

class Derived : public Base {
public:
    void func1() override { std::cout << "Derived::func1\n"; }
    void func2() override { std::cout << "Derived::func2\n"; }
};

int main() {
    Base* obj = new Derived(); // Polymorphic object

    // Step 1: Get the vptr (assumes it's the first hidden member)
    uintptr_t* vptr = reinterpret_cast<uintptr_t*>(obj);

    // Step 2: Dereference vptr to get the vtable address
    uintptr_t* vtable = reinterpret_cast<uintptr_t*>(*vptr);

    // Step 3: Access function pointers from the vtable
    // (Assuming func1 is at index 0, func2 at index 1)
    using FuncPtr = void (*)();
    FuncPtr f1 = reinterpret_cast<FuncPtr>(vtable[0]);
    FuncPtr f2 = reinterpret_cast<FuncPtr>(vtable[1]);

    // Step 4: Call the functions
    f1(); // Should call Derived::func1
    f2(); // Should call Derived::func2

    delete obj;
    return 0;
}
```