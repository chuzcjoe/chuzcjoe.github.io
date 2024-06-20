---
title: constexpr VS consteval
author: Joe Chu
date: 2024-06-13 23:28:57
tags: [constexpr, consteval]
categories:
- cpp
---

Discuss some differences.

<!-- more -->

# 1. Introduction

In C++, both constexpr and consteval are used to indicate that a function or variable should be evaluated at compile time. However, they have different purposes and restrictions.

# 2. Compare

|  | constexpr | consteval |
|---|---|---|
| definition | can be applied to variables, functions, and constructors | since C++20, can only be applied to functions. |
| evaluation | 1. A `constexpr` function can be evaluated at compile time if its arguments are compile-time constants. <br>However, it can also be evaluated at runtime if called with runtime values.<br>2. A `constexpr` variable is always a compile-time constant. | A `consteval` function must be evaluated at compile time. If called at runtime, the program will not compile. |
| use case | `constexpr` is used when you want a function or variable to potentially <br>be evaluated at compile time, but it is not mandatory. This provides more flexibility. | `consteval` is used when you want to ensure that a function is always evaluated at compile time. |

```cpp
#include <iostream>

// constexpr function: Can be evaluated at both compile-time and runtime
constexpr int square(int x) {
    return x * x;
}

// consteval function: Must be evaluated at compile-time
consteval int factorial(int n) {
    return (n <= 1) ? 1 : (n * factorial(n - 1));
}

int main() {
    // Compile-time evaluation of constexpr function
    constexpr int result1 = square(5);  // Evaluated at compile-time

    // Runtime evaluation of constexpr function
    int y = 10;
    int result2 = square(y);  // Evaluated at runtime

    std::cout << "square(5) (compile-time): " << result1 << std::endl;
    std::cout << "square(10) (runtime): " << result2 << std::endl;

    // Compile-time evaluation of consteval function
    constexpr int factResult = factorial(5);  // Evaluated at compile-time
    std::cout << "factorial(5) (compile-time): " << factResult << std::endl;

    // Attempt to use consteval function at runtime will cause a compilation error
    // int runtimeFact = factorial(y);  // Uncommenting this line will cause a compilation error

    return 0;
}
```
```
square(5) (compile-time): 25
square(10) (runtime): 100
factorial(5) (compile-time): 120
```

```cpp
#include <iostream>

struct A {
    int _x;
    constexpr A(int x) : _x(x) {}
};

struct B {
    int _x;
    consteval B(int x) : _x(x) {}
};

int main () {
    A a1{1}; // Compile-time
    int x = 1;
    A a2{x}; // runtime

    B b1{1}; // Compile-time
    // B b2{x}; // Error
}
```