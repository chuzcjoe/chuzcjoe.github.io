---
title: Revisit Static Cast and Dynamic Cast
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
date: 2025-03-11 21:24:59
tags: [static cast, dynamic cast]
categories:
- cpp
---

From a low level perspective.

<!-- more -->

# 1. Static Cast

`static_cast` for downcasting(cast Base to Derived) is unsafe and will cause undefined behavior. For example:
```cpp
class Base {
public:
    int x;
};

class Derived : public Base {
public:
    int y;
};

int main() {
    Base* bPtr = new Base{};
    Derived* dPtr = static_cast<Derived*>(bPtr);
    dPtr->y = 10;
}
```

The Problem here is the object pointed to by `bPtr` is a Base instance, not a Derived instance. Base doesn’t have a `y` member, so accessing `dPtr->y` is undefined behavior (UB).

From the memory layout perspective, `Base` and `Derived` have different structures.
```
Base object memory layout:
Address       Content
b+0           x (4 bytes)


Derived object memory layout:
Address       Content
d+0           x (inherited from Base, 4 bytes)
d+4           y (4 bytes)
```

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cpp/revisit-cast/0.png" title="Image 1" width="700px" height="600px">
</p>

- `Base* b = new Base{};` sets `bPtr` to the address of the Base object, e.g., `0x1000`. The object at `0x1000` contains only `x`. 
- `Derived* dPtr = static_cast<Derived*>(bPtr);` tells the compiler to treat the pointer `bPtr` as if it points to a Derived object.
- `dPtr` also points to `0x1000`
- Since `static_cast` is compile-time casting and now the compiler assumes `dPtr` points to a `Derived` object with layout `{x, y}`.
- When we do `dPtr->y = 10;`, the compiler knows the layout of `Derived` and calculates the offset of `y` relative to the start of a Derived object. Since `x` is at offset 0 (4 bytes) and `y` is at offset 4 (next 4 bytes), `dPtr->y` translates to `*(dPtr + 4)` (in byte terms).

Writing to `0x1004` (for `dPtr->y`) accesses memory beyond the allocated Base object. This is **undefined behavior**. It is now easy to understand that **upcasting** using `static_cast` is safe since `Base` memory layout is part of the `Derived` memory layout, and there is no **memory overrun** issue.

# 2. Dynamic Cast

`dynamic_cast` can also be used for downcasting (Base to Derived). `dynamic_cast` relies on **Run-Time Type Information (RTTI)**, which is implemented using `vptr` (virtual table pointer) and `vtable` in polymorphic classes. In other words, for `dynamic_cast` to work, the base class must have at least one virtual function.

```cpp
class Base {
public:
    virtual ~Base() {} // Enables RTTI
};

class Derived : public Base {};

int main() {
    Base* b = new Derived(); // Upcasting
    Derived* d = dynamic_cast<Derived*>(b); // Downcasting

    if (d) {
        std::cout << "Cast successful\n";
    } else {
        std::cout << "Cast failed!\n";
    }

    delete b;
}
```

What happens internally when we do `dynamic_cast<Derived*>(b)` is:
- Since the inheritance is polymorhic, we have a `vptr` pointing to a `vtable`.
- Retrieve `vptr` from `b` and find the corresponding `vtable`.
- Read RTTI metadata to get type info.
- Check if `b`'s actual type is `Derived`.
- Return a valid pointer if the retrived type matches the target cast type.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cpp/revisit-cast/1.png" title="Image 1" width="700px" height="600px">
</p>

We can inpsect the raw memory to verify it.
```cpp
#include <iostream>
#include <typeinfo>
#include <cstdint>

class Base {
public:
    virtual ~Base() {}
};

class Derived : public Base {
};

int main() {
    Base* b = new Derived{};

    // Get vptr (first pointer in the object)
    uintptr_t* vptr = reinterpret_cast<uintptr_t*>(b);
    // Get vtable
    uintptr_t* vtable = reinterpret_cast<uintptr_t*>(*vptr);

    std::cout << "vtable address: " << vtable << std::endl;
    // Get RTTI metadata (located before the first function pointer)
    std::cout << "RTTI address: " << reinterpret_cast<uintptr_t*>(vtable[-1]) << std::endl;
    // Access type_info from RTTI metadata
    std::cout << "Type name: " << ((std::type_info*)vtable[-1])->name() << std::endl;

    return 0;
}
```

```
vtable address: 0x5618a6a30d38
RTTI address: 0x5618a6a30d58
Type name: 7Derived
```

`b` is indeed a `Derived` type, so the cast is Ok. From the analysis above, we can conclude that `dynamic_cast` only works when there is at least one virtual function in `Base` class as it relies on **RTTI metadata** to decide the runtime type information.