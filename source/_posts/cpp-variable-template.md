---
title: Variable Template
author: Joe Chu
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
  - position: left
    type: categories
date: 2024-07-13 22:05:42
tags: [cpp]
categories:
- cpp
---

Since C++14

<!-- more -->

# 1. Introduction

Variable templates in C++ are a feature introduced in C++14 that allows you to define a variable that is parameterized by one or more template parameters. This is similar to how you define template functions or classes, but for variables. Variable templates can be useful for defining constants or other variables that need to vary based on the type or other template parameters.

# 2. A Starter Example

```cpp
#include <iostream>
#include <memory>
#include <vector>

template<typename T>
constexpr T pi = T(3.1415926535897932385L); // variable template
 
// function template
template<typename T>
T circular_area(T r) {
    return pi<T> * r * r; // pi<T> is a variable template instantiation
}

int main() {
    std::cout << "circular_area<int>(1) = " << circular_area<int>(1) << '\n';
    std::cout << "circular_area<float>(1.) = " << circular_area<float>(1.) << '\n';
    std::cout << "circular_area<double>(1.) = " << circular_area<double>(1.) << '\n';
}
```
```
circular_area<int>(1) = 3
circular_area<float>(1.) = 3.14159
circular_area<double>(1.) = 3.14159
```

# 3. In Class Scope

When used within class scope, variable templates usually declare as `static`.
```cpp
template<typename T>
class MathConstants {
public:
    static constexpr T pi = T(3.1415926535897932385);
    static constexpr T e = T(2.7182818284590452353);
    
    template<int N>
    static constexpr T power_of_two = T(1 << N);
};

// Usage
double pi_value = MathConstants<double>::pi;
float e_value = MathConstants<float>::e;
int eight = MathConstants<int>::power_of_two<3>;
```

# 4. Fibonacci Using Variable Template

```cpp
template<int N>
constexpr int fibonacci = fibonacci<N-1> + fibonacci<N-2>;

// specialized template for base case 0
template<>
constexpr int fibonacci<0> = 0;

// specialized template for base case 1
template<>
constexpr int fibonacci<1> = 1;
```

# References

- https://en.cppreference.com/w/cpp/language/variable_template