---
title: Auto-type Deduction Rules
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
date: 2025-01-17 21:00:28
tags: [cpp]
categories:
- cpp
---

Auto-type deduction allows the compiler to deduce the type of a variable from its initializer.

<!-- more -->

Source code on [C++ insights](https://cppinsights.io/lnk?code=I2luY2x1ZGUgPGluaXRpYWxpemVyX2xpc3Q+CiNpbmNsdWRlIDxpb3N0cmVhbT4KCi8vIDEuIGRlZHVjdGlvbiB3aXRoIHJlZmVyZW5jZQppbnQgYTEgPSAzOwppbnQmIHJlZiA9IGExOwphdXRvIGIxID0gcmVmOwphdXRvJiBjMSA9IHJlZjsKCi8vIDIuIGRlZHVjdGlvbiB3aXRoIGNvbnN0CmNvbnN0IGludCBhMiA9IDM7CmF1dG8gYjIgPSBhMjsKY29uc3QgYXV0byBjMiA9IGEyOwoKY29uc3QgaW50KiBjb25zdCBkMiA9ICZhMjsKYXV0byBlMiA9IGQyOwpjb25zdCBhdXRvIGYyID0gZDI7CgovLyAzLiBkZWR1Y3Rpb24gd2l0aCBwb2ludGVycwppbnQgYTMgPSAzOwppbnQqIHAzID0gJmEzOwphdXRvIGIzID0gcDM7CgovLyA0LiBkZWR1Y3Rpb24gd2l0aCBhcnJheXMKaW50IGFycjRbXSA9IHsxLCAyLCAzLCA0fTsKYXV0byBhNCA9IGFycjQ7IC8vIGludCoKYXV0byYgYjQgPSBhcnI0OwoKLy8gNS4gZGVkdWN0aW9uIHdpdGggZnVuY3Rpb25zCmludCBmNShpbnQgYSkge3JldHVybiBhO30KYXV0byBhNSA9IGY1OwoKLy8gNi4gZGVkdWN0aW9uIHdpdGggYXV0byYmCmludCBhNiA9IDM7CmF1dG8mJiBiNiA9IGE2OwphdXRvJiYgYzYgPSAzOwphdXRvJiYgZDYgPSBzdGQ6Om1vdmUoYTYpOwoKLy8gNy4gZGVkdWN0aW9uIHdpdGggbGFtYmRhCmF1dG8gbG0xID0gW10oaW50IHgpIHtyZXR1cm4geDt9OwphdXRvIGxtMiA9IFtdKGF1dG8geCkge3JldHVybiB4O307CmF1dG8gbG0zID0gW10oaW50IHgpIC0+IGRvdWJsZSB7cmV0dXJuIHggKyAwLjU7fTsKCi8vIDguIGRlZHVjdGlvbiB3aXRoIGRlY2x0eXBlKGF1dG8pCmludCBhOCA9IDQyOwppbnQmIHJlZjggPSBhODsKZGVjbHR5cGUoYXV0bykgYjggPSByZWY4OwoKLy8gOS4gZGVkdWN0aW9uIHdpdGggYXV0byoKaW50IGE5ID0gMzsKYXV0byogcDEgPSAmYTk7IC8vIGludCosIGVycm9yIGNhc2U6IGF1dG8gcDEgPSBhOSwgc2luY2UgYTkgaXMgbm90IGEgcG9pbnRlciBvciBhbiBhZGRyZXNzCmludCBhcnJbXSA9IHsxLCAyLCAzfTsKYXV0byogcDIgPSBhcnI7IC8vIGludCoKY29uc3QgaW50IGI5ID0gMzsKYXV0byogcDMzID0gJmI5OyAvLyBjb25zdCBpbnQqCmludCogcDQgPSAmYTk7CmF1dG8qIHA1ID0gJnA0OyAvLyBpbnQqKgoKCgoKCg==&insightsOptions=cpp17&std=cpp17&rev=1.0)

# 1. Deduction with reference

If the initializer is a reference, the reference type is stripped, and `auto` deduces the underlying type. If you want `auto` to deduce a reference, you must explicitly use `auto&`.

```cpp source.cpp
int a1 = 3;
int& ref = a1;
auto b1 = ref; // int b1 = ref;
auto& c1 = ref; // int& c1 = ref;
```

# 2. Deduction with const

If the initializer is `const`, auto deduces the type without `const` unless explicitly specified.

```cpp source.cpp
const int a2 = 3;
auto b2 = a2; // int b2 = a2;
const auto c2 = a2; // const int c2 = a2;
```

In C++, `const` can appear in different context, and its role can be categorized as either **top-level** const or **low-level** const.

**Top-level const** applies to the object itself, indicating that the object itself cannot be modified.
```cpp example.cpp
const int x = 42;  // `x` is a `const int` (the value of `x` cannot be modified)
int* const ptr = &x; // `ptr` is a `const pointer` to `int` (the pointer itself cannot change, but the pointee can)
```

**Low-level const** applies to the type being referred to or pointed to. It means the value being referred to or pointed to cannot be modified.
```cpp example.cpp
const int* ptr = &x;   // `ptr` is a pointer to a `const int` (the value of the pointee cannot be modified)
const int* const cptr = &x; // `cptr2` is a `const pointer` to a `const int`, the left const is low-level const
```

`It is important to note that:` 
**Top-level const** is ignored when using auto-type deduction unless explicitly specified. **Low-level const** is preserved during auto-type deduction.
```cpp example.cpp
const int a2 = 3;
const int* const d2 = &a2;
auto e2 = d2; // const int*
const auto f2 = d2; // const int* const
```

# 3. Deduction with pointers

If a pointer is involved, `auto` deduces the pointer type.

```cpp example.cpp
int a3 = 3;
int* p3 = &a3;
auto b3 = p3; // int*
```

# 4. Deduction with Arrays

For arrays, `auto` deduces to a pointer to the first element of the array. `auto&` deduces the array type.

```cpp example.cpp
int arr4[] = {1, 2, 3, 4};
auto a4 = arr4; // int*
auto& b4 = arr4; // int(&)[4]
```

# 5. Deduction with Functions

For functions, `auto` deduces to a function pointer.

```cpp example.cpp
int f5(int a) {return a;}
auto a5 = f5; // int(*)int
```

# 6. Deduction with auto&&

`auto&&` deduces a reference type.

1. If the initializer is an lvalue, auto&& deduces an lvalue reference.
2. If the initializer is an rvalue, auto&& deduces an rvalue reference.

```cpp example.cpp
int a6 = 3;
auto&& b6 = a6; // int&
auto&& c6 = 3; // int&&
auto&& d6 = std::move(a6); // int&&
```

# 7. Deduction with Lambda

`auto` can be used to deduce the return type of a lambda.

```cpp example.cpp
int a7 = 3;
auto lm1 = [](int x) {return x;};
auto lm2 = [](auto x) {return x;};
auto lm3 = [](int x) -> double {return x + 0.5;};
auto lm4 = [&]() -> decltype(auto) {
  return a7; // Returns by reference
};
```

# 8. Deduction with decltype(auto)

`decltype(auto)` is used when you want the deduced type to match the initializer's type exactly, including references.

```cpp example.cpp
int a8 = 42;
int& ref8 = a8;
decltype(auto) b8 = ref8; // int&
```

# 9. Deduction with auto*

`auto*` is deduced as a pointer type.

```cpp example.cpp
int a9 = 3;
auto* p1 = &a9; // int*, error case: auto p1 = a9, since a9 is not a pointer or an address
int arr[] = {1, 2, 3};
auto* p2 = arr; // int*
const int b9 = 3;
auto* p33 = &b9; // const int*
int* p4 = &a9;
auto* p5 = &p4; // int**
```