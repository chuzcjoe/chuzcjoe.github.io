---
title: Explicit Specifier
author: Joe Chu
date: 2023-12-07 20:38:28
tags: [cpp]
categories:
- cpp
---

Prevent C++ implicit conversion.

<!-- more -->

# Introduction

In C++, the explicit keyword is used with constructors to prevent them from performing implicit conversions. Implicit means automatic. It happens without us explicitly specifying the compiler what to do. By adding the `explicit` keyword before a constructor, we force the compiler not to perform any implict conversions.

# Exanple

The following declarations are legal. The compiler converts the single argument to the class beging constructed.

```c++
class Base {
public:
    Base() {}
    Base(int x) {}
    Base(const char* s) {}
};


int main() {
    Base b1 = 10; // equivalent to Base b1 = Base(10);
    Base b2 = "C++"; // equivalent to Base b2 = Base("C++");
    
    return 0;
}
```

To prevent such implicit conversions, we can declare constructors with `explicit` keyword. Thus, the previous declaration would be illegal.

```c++
class Base {
public:
    Base() {}
    explicit Base(int x) {}
    explicit Base(const char* s) {}
};


int main() {
    Base b1 = Base(10);
    Base b2 = Base("C++");
    
    return 0;
}
```

# References
- https://www.ibm.com/docs/en/i/7.1?topic=only-explicit-specifier-c
- https://www.scaler.com/topics/cpp-explicit/