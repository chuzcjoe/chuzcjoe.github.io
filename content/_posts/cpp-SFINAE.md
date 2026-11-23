---
title: SFINAE
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
    index: true
    collapsed: true
    depth: 3
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2025-02-09 11:03:54
tags: [SFINEA]
categories:
- cpp
---

"Substitution Failure is Not An Error"

<!-- more -->


# 1. Introduction

According to the definition on cppreference, **SFINAE** rule applies during overload resolution of function templates: When substituting the explicitly specified or deduced type for the template parameter fails, the specialization is discarded from the overload set instead of causing a compile error. This feature is used in template metaprogramming.

What it means is that:

- When multiple function templates are available, the compiler attempts to instantiate them one by one.
- If one instantiation fails due to an invalid substitution, the compiler simply ignores that function instead of generating a compile-time error.
- The compiler continues searching for another viable function in the overload set.

Here is an example of how **SFINAE** can preventing compilation errors:
```cpp example.cpp
#include <iostream>
#include <type_traits>

// Template function only enabled if T is an integer type
template <typename T>
std::enable_if_t<std::is_integral_v<T>, void> foo(T) {
    std::cout << "Integer overload\n";
}

// Template function only enabled if T is a floating-point type
template <typename T>
std::enable_if_t<std::is_floating_point_v<T>, void> foo(T) {
    std::cout << "Floating-point overload\n";
}

int main() {
    foo(42);    // Calls integer overload
    foo(3.14);  // Calls floating-point overload
    // foo("hello"); Error: No valid overload (not an integer or floating point)
}
```

What Happens in Overload Resolution?
1. foo(42)

  - `T = int`
  - `std::enable_if_t<std::is_integral_v<int>, void>` → Valid
  - Integer overload remains in the overload set.
  - Calls the integer overload.

2. foo(3.14)

  - `T = double`
  - `std::enable_if_t<std::is_floating_point_v<double>, void>` → Valid
  - Floating-point overload remains in the overload set.
  - Calls the floating-point overload.

3. foo("hello")

  - `T = const char*`
  - `std::enable_if_t<std::is_integral_v<int>, void>` → Fails (not an integer)
  - `std::enable_if_t<std::is_floating_point_v<int>, void>` → Fails (not a floating point)
  - Both overloads are discarded.
  - Compilation error: No matching function found.

**SFINAE** (Substitution Failure Is Not An Error) can be achieved in multiple ways in C++.
1. `std::enable_if` in function return type.
2. Overloaded functions with `std::enable_if`.
3. Class template specialization.
4. Expression SFINAE (decltype).
5. `concept`

Let's look at each one of them in the next sections.

Before we move on to the next section, it will be helpful to have some basic understanding about common type traits in C++.

| Type Trait                  | Meaning                                                                 |
|-----------------------------|-------------------------------------------------------------------------|
| `std::is_integral<T>`       | Checks if `T` is an integer type (`int`, `char`, `long`, etc.)          |
| `std::is_floating_point<T>` | Checks if `T` is `float`, `double`, or `long double`                    |
| `std::is_pointer<T>`        | Checks if `T` is a pointer type (`T*`)                                  |
| `std::is_reference<T>`      | Checks if `T` is a reference type (`T&` or `T&&`)                       |
| `std::is_array<T>`          | Checks if `T` is an array                                               |
| `std::is_class<T>`          | Checks if `T` is a class or struct                                      |
| `std::is_enum<T>`           | Checks if `T` is an enum                                                |
| `std::is_same<T, U>`        | Checks if `T` and `U` are the same type                                 |
| `std::is_convertible<T, U>` | Checks if `T` is implicitly convertible to `U`                          |

Since `std::enable_if` is used frequently to achieve **SFINAE**, it is necessary to first understand its meaning and usage.

`std::enable_if` is available in `<type_traits>`. Its possible definition could be:

```cpp
template< bool B, class T = void >
struct enable_if {};

// Partial specialization: Only defined when B is true
template< class T >
struct enable_if<true, T> { using type = T; };

// Helper alias
template< bool B, class T = void >
using enable_if_t = typename enable_if<B, T>::type;
```

Let's reuse the example above and include our defined `enable_if` struct.

```cpp
template <typename T>
enable_if_t<std::is_integral_v<T>, void> foo(T) {
    std::cout << "integral overload\n";
}

int main() {
    foo(42);    // OK
    // foo(3.14);  // Error
}
```

**When we call foo(42)**:
1. `std::is_integral_v<T>` evaluates to be `true`.
2. When `true`, we have a typename `type = void`.
3. The function can be expanded to: `void foo(int value)`, which is a valid signiture.


**When we call foo(3.14)**:
1. `T = double`, which is not an integral type.
2. `std::is_integral_v<double> == false`.
3. Since `std::enable_if<false, void>` has no type member, the function is discarded.
4. There is no matching function, so the substitution fails.

# 2. Function return type

`std::enable_if` allows us to conditionally enable or disable function templates based on type traits by using its associated type alias.

```cpp
// Helper types
template< bool B, class T = void >
using enable_if_t = typename enable_if<B,T>::type;


template <typename T>
std::enable_if_t<std::is_integral_v<T>, void> foo(T value) {
    std::cout << "Integral type: " << value << "\n";
}
```

```cpp
// Only enable if T is an integral type
template <typename T>
std::enable_if_t<std::is_integral_v<T>, void> foo(T value) {
    std::cout << "Integral: " << value << "\n";
}

foo(42); // Ok
foo(3.14) // error
```

if `T` is an integral type, `std::enable_if_t<std::is_integral_v<T>, void>` resolves to `void`, which is a valid function signiture. However, if `T` is a double type, substitution fails, and the function discarded, leading to `no matching function call`.


# 3. Function overload

```cpp
template <typename T>
std::enable_if_t<std::is_integral_v<T>> print(T value) {
    std::cout << "Integral: " << value << "\n";
}

template <typename T>
std::enable_if_t<std::is_floating_point_v<T>> print(T value) {
    std::cout << "Floating-point: " << value << "\n";
}
```

# 4. Template specialization

```cpp
// Primary template (disabled by default)
template <typename T, typename Enable = void>
struct Foo;

// Specialization for integral types
template <typename T>
struct Foo<T, std::enable_if_t<std::is_integral_v<T>>> {
    static void print() { std::cout << "Integral type\n"; }
};

// Specialization for floating-point types
template <typename T>
struct Foo<T, std::enable_if_t<std::is_floating_point_v<T>>> {
    static void print() { std::cout << "Floating-point type\n"; }
};
```

We leave the primary template undefined for two purposes:
1. Prevents the use of `Foo<T>` with unsupported types (such as `std::string`).
2. The default `Enable = void` parameter allows `std::enable_if` specializations to work smoothly by using SFINAE.

# 5. Expression SFINAE

SFINAE can be applied based on whether an expression is valid.

```cpp
template <typename T>
auto has_size(const T& obj) -> decltype(obj.size(), std::true_type{}) {
    return std::true_type{}; // If `size()` exists, this overload is selected
}

std::false_type has_size(...) { 
    return std::false_type{}; 
} // Fallback if `size()` doesn't exist

int main() {
    std::vector<int> v;
    int x = 42;

    std::cout << has_size(v).value << std::endl; // Output: 1 (vector has size())
    std::cout << has_size(x).value << std::endl; // Output: 0 (int has no size())
}
```

`decltype(obj.size(), std::true_type{})`, if `obj.size()` is not valid, the compiler can not evaluate and it fails at substitution. This is when **SFINEA** kicks in and the function is discarded.

# 6. Using `concept` (C++20)

In C++20, concepts provide a powerful way to constrain template parameters, offering an alternative to traditional SFINAE techniques. Concepts are more readable and expressive than using std::enable_if or other SFINAE tricks.

A `concept` is a predicate that defines a set of requirements for a type. You can think of it as a constraint on the template parameters, which is checked at compile time.

Basic usage:
```cpp
template <typename T>
concept Integral = std::is_integral_v<T>;  // Concept to check if T is an integral type

template <Integral T>  // Use the Integral concept to constrain T
void print(T value) {
    std::cout << "Integral: " << value << std::endl;
}
```

Multiple concepts:
```cpp
template <typename T>
concept IntegralAndArithmetic = std::is_integral_v<T> && std::is_arithmetic_v<T>;

template <IntegralAndArithmetic T>
void print(T value) {
    std::cout << "Integral and Arithmetic: " << value << std::endl;
}
```

Combined with `requires` for more complex constraints. The `requires` clause in C++20 is used to specify constraints on template parameters. It allows you to check conditions on types or expressions at compile time. This is part of the new concept-based feature in C++20,
```cpp
template <typename T>
concept HasSize = requires(T a) {
    { a.size() } -> std::same_as<std::size_t>;  // Check if T has size() returning std::size_t
};

template <HasSize T>
void printSize(T obj) {
    std::cout << "Size: " << obj.size() << std::endl;
}
```

# 7. Conclusion
In this post, we discussed some common SFINAE implementations. Of course, there are some other techniques such as `std::void_t`, default template parameters, etc. Interested readers can continue to explore on these topics.

# References
- https://en.cppreference.com/w/cpp/language/sfinae
- https://en.cppreference.com/w/cpp/types/enable_if