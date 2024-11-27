---
title: Static Polymorphism
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: /img/me.jpeg
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
    index: true
    collapsed: true
    depth: 3
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2024-11-24 20:21:57
tags: [polymorphism]
categories:
- cpp
---

Compile time polymorphism.

<!-- more -->

# 1. Introduction

Static polymorphism in C++ is achieved using templates and compile-time mechanisms. Unlike dynamic polymorphism (achieved with inheritance and virtual functions), static polymorphism determines which function to call at compile time, resulting in better performance because there is no runtime overhead like virtual table lookups.

The most common method to achieve static polymorphism in C++ is through **templates** and **CRTP (Curiously Recurring Template Pattern)**.

# 2. CRTP(Curiously Recurring Template Pattern)

CRTP is a design pattern where a derived class inherits from a base class that is templated on the derived class. This allows compile-time polymorphism with no runtime overhead.

```cpp CRTP.cpp
#include <iostream>

template <typename Derived>
class Base {
public:
    void interface() {
        // Call the derived class implementation
        static_cast<Derived*>(this)->implementation();
    }
};

class Derived : public Base<Derived> {
public:
    void implementation() {
        std::cout << "Derived implementation called." << std::endl;
    }
};

int main() {
    Derived d;
    d.interface(); // Calls Derived::implementation
    return 0;
}
```

Here is a more generic example.
```cpp shape.cpp
#include <iostream>

// Base class template
template <typename Derived>
class Shape {
public:
    void draw() {
        // Call the derived class's implementation
        static_cast<Derived*>(this)->draw();
    }
};

// Derived class
class Circle : public Shape<Circle> {
public:
    void draw() {
        std::cout << "Drawing a Circle" << std::endl;
    }
};

// Another derived class
class Square : public Shape<Square> {
public:
    void draw() {
        std::cout << "Drawing a Square" << std::endl;
    }
};

int main() {
    Shape<Circle> c;
    Shape<Square> s;

    c.draw(); // Outputs: Drawing a Circle
    s.draw(); // Outputs: Drawing a Square

    return 0;
}
```

# 3. Comparison with Dynamic Polymorphism

| Feature           | Static Polymorphism                     | Dynamic Polymorphism                |
|-------------------|------------------------------------------|--------------------------------------|
| **Binding Time**  | Compile-time                            | Runtime                              |
| **Implementation**| Templates, CRTP                         | Virtual functions, inheritance       |
| **Performance**   | Faster (no vtable lookup)               | Slower due to runtime overhead       |
| **Flexibility**   | Limited (known types at compile time)    | Flexible (can use any derived type at runtime) |

# 4. Conclusion

You should use static polymorphism when:

- You need polymorphism but want to avoid the overhead of dynamic dispatch.
- In scenarios where the type of objects involved is known at compile-time.
- Your system is performance-critical.