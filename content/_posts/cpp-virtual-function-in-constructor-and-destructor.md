---
title: Virtual Functions in Constructor and Descturctor
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
date: 2025-04-25 23:16:25
tags: [virtual function]
categories:
- cpp
---

1. What is the behavior of invoking virtual functions from constructors or destructors?
2. You should avoid invoking virtual functions from constructors or destructors.

<!-- more -->

# 1. Behavior

Invoking virtual functions from constructors and destructors will restrict the dynamic dispatch.

```cpp
class Base {
public:
    Base() { init(); }
    virtual ~Base() { release(); }

    virtual void init() {
        std::cout << "Base::init()\n";
    }

    virtual void release() {
        std::cout << "Base::release()\n";
    }
};

class Derived : public Base {
public:
    Derived() {}
    ~Derived() {}

    virtual void init() override {
        std::cout << "Derived::init()\n";
    }

    virtual void release() override {
        std::cout << "Derived::release()\n";
    }
};


int main() {
    Base* b = new Derived;
    delete b;
}
```

```
Base::init()
Base::release()
```

The core reason C++ disables dynamic dispatch in constructors and destructors is **safety**—to avoid invoking virtual functions on an incompletely constructed or already partially destroyed object, which would lead to undefined behavior.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cpp/virtual-function-constructor-destructor/order.png" title="Image 1" width="800px" height="700px">
</p>

# References
- https://wiki.sei.cmu.edu/confluence/display/cplusplus/OOP50-CPP.+Do+not+invoke+virtual+functions+from+constructors+or+destructors