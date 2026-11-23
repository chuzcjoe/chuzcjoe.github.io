---
title: Concept in C++
author: Joe Chu
tags:
  - concept
categories:
  - cpp
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
date: 2025-06-14 22:06:16
---


C++20 introduced concept as a major language feature that allows developers to specify constraints on template parameters.

<!-- more -->

# Table of Contents

> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 1. Intro </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 2. Concept Syntax </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 3. Requires Expression </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 4. Error Messages </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 5. Practices </span>

# 1. Intro

Before C++20, template constraints are achieved by using `SFINAE`, which lacks readability and error messages. `concept` provides clear template constraints that are easy to read and understand.

```cpp
// SFINAE way
// specify template type to be int or char
template <typename T>
std::enable_if_t<std::is_integral_v<T>, void> foo(T) {
    std::cout << "Integer overload\n";
}
```
When `T` is a type of `integral`, then the expression `std::enable_if_t<std::is_integral_v<T>, void>` will be evaluated to be `true`. The function signature is valid. Otherwise, the function will be discarded, leading to compile error of "no matching function".

To achieve the same thing using `concept`.
```cpp
template <typename T>
concept Integral = std::is_integral_v<T>;  // Concept to check if T is an integral type

template <Integral T>  // Use the Integral concept to constrain T
void print(T value) {
    std::cout << "Integral: " << value << std::endl;
}
```

# 2. Concept Syntax

We will define a `concept` named `Addable` which checks whether two objects of type `T` can be added together using the `+` operator. Here are some common usages of how to apply this `concept`.

```cpp
// Define a concept
template<typename T>
concept Addable = requires(T a, T b) {
    {a + b} -> std::convertible_to<T>;
};

// method 1: template parameter constraint
template<Addable T>
void add1(T a, T b) {
    std::cout << a << " + " << b << " = " << a + b << std::endl;
}

// method 2: Abbreviated function template (new in C++20)
void add2(Addable auto a, Addable auto b) {
    std::cout << a << " + " << b << " = " << a + b << std::endl;
}

// method 3: Trailing requires clause
template<typename T>
void add3(T a, T b) requires Addable<T> {
    std::cout << a << " + " << b << " = " << a + b << std::endl;
}

// method 4: Requires clause
template<typename T>
requires Addable<T>
void add4(T a, T b) {
    std::cout << a << " + " << b << " = " << a + b << std::endl;
}
```

We can also use logical operators to combine multiple constraints.

```cpp
template <typename T>
concept Numeric = std::integral<T> || std::floating_point<T>; // check if T is either int or float
```

```cpp
template <typename T>
concept IntegralAndRegular = std::integral<T> && std::regular<T>; // T is an integral type and supports copy, move, and equality
```

# 3. Requires Expression

The `requires` expression is a new language construct in C++20 that allows you to specify requirements within concept definitions. The basic syntax for `requires` is:

```cpp
requires (parameter-list) { 
  requirement-seq 
}	
```

Where `parameter-list` is optional and `requirement-seq` can be one of the followings:
- simple requirement
- type requirement
- compound requirement
- nested requirement

***Simple requirement** requires that the expressions must be valid.
```cpp
template<typename T>
concept BasicContainer = requires(T container) {
    container.size();           // Must have size() method
    container.empty();          // Must have empty() method
    container.begin();          // Must have begin() method
    container.end();            // Must have end() method
};
```

**Type requirement*** requires that a type member exists and is valid.
```cpp
template<typename T>
concept ContainerWithTypes = requires {
    typename T::value_type;     // Must have value_type
    typename T::iterator;       // Must have iterator type
    typename T::const_iterator; // Must have const_iterator type
};
```

**Compound requirement**
Basic syntax:
```cpp
requires {
  expression1 -> ReturnType;
  expression2 -> ReturnType;
  expression3 -> ReturnType;
  ...
}
```

A compound requirement does two things:
1. Checks if the expression is valid.
2. Checks whether the result type of the expression matches a given type.

```cpp
template<typename T>
concept Comparable = requires(T a, T b) {
    // Expression must be valid AND return bool
    { a == b } -> std::convertible_to<bool>;
    { a != b } -> std::convertible_to<bool>;
    { a < b } -> std::convertible_to<bool>;
};
```

**Nested requirement** is a situation where a `requires` clause is embedded inside another `requires` clause. It performs additional constraints check.
```cpp
template<typename T>
concept ComplexContainer = requires(T container) {
    // Simple requirements
    container.size();
    container.empty();
    
    // Nested requirements
    requires std::same_as<typename T::value_type, int>;
    requires requires(typename T::iterator it) {
        *it;
        ++it;
    };
};
```

# 4. Error Messages

Unlike SFINAE (which only output: "no matching function found"), with `concept`, we can have a more clear error message. In case if we accidentally use a wrong data type:
```cpp
template<std::signed_integral T>
T process_signed_integer(T value) {
    return value * 2;
}

process_signed_integer(1.0);
```

We will see a error message like this:
```
Compiler returned: 1
Compiler stderr
<source>:46:5: error: no matching function for call to 'process_signed_integer'
   46 |     process_signed_integer(1.0);
      |     ^~~~~~~~~~~~~~~~~~~~~~
<source>:36:3: note: candidate template ignored: constraints not satisfied [with T = double]
   36 | T process_signed_integer(T value) {
      |   ^
<source>:35:10: note: because 'double' does not satisfy 'signed_integral'
   35 | template<std::signed_integral T>
```

# 5. Practices

Here's a practical real-world example to illustrate the use of `concept`. Imagine we are developing an e-commerce platform for selling products. We can simply classify products into two categories: physical products and digital products. All products share some common attributes, such as a name, price, and unique ID. However, each product type also has its own specific characteristics—for instance, physical products may include properties like weight and dimensions, while digital products might have attributes such as file size and download link.

```cpp
// Basic concept: What every product in our store must have
template<typename T>
concept Product = requires(T product) {
    // Every product must have these basic properties
    { product.get_name() } -> std::convertible_to<std::string>;
    { product.get_price() } -> std::convertible_to<double>;
    { product.get_id() } -> std::convertible_to<int>;
    
    // Every product must be able to display itself
    { product.display_info() } -> std::convertible_to<std::string>;
};

// Concept for products that can be shipped physically
template<typename T>
concept PhysicalProduct = Product<T> && requires(T product) {
    { product.get_weight() } -> std::convertible_to<double>;
    { product.get_dimensions() } -> std::convertible_to<std::string>;
    { product.is_fragile() } -> std::convertible_to<bool>;
};

// Concept for products that can be downloaded
template<typename T>
concept DigitalProduct = Product<T> && requires(T product) {
    { product.get_file_size() } -> std::convertible_to<long>;
    { product.get_download_link() } -> std::convertible_to<std::string>;
    { product.get_format() } -> std::convertible_to<std::string>;
};
```

# References
- https://en.cppreference.com/w/cpp/concepts.html
- https://en.cppreference.com/w/cpp/language/requires.html
- https://en.cppreference.com/w/cpp/language/constraints.html