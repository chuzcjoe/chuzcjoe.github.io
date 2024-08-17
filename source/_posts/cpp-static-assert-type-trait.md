---
title: Static Assertion and Type Trait
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
date: 2024-08-03 11:06:21
tags: [static assertion, type trait]
categories:
- cpp
toc: true
---

Use static assertion and type trait for error check.

<!-- more -->

# 1. Static Assertion

`static_assert` is a compile-time assertion that checks if a given condition is true.

```cpp
#include <type_traits>

template <typename T, int Size>
class Vector
{
   static_assert(Size < 5, "Size is too large");
   T _points[Size];
};

int main()
{
   Vector<int, 16> a1;
   Vector<double, 2> a2;
   static_assert(sizeof(int) == 4, "The size of int is not 4 bytes.");

   return 0;
}
```
```
<source>:6:4: error: static_assert failed due to requirement '16 < 5' "Size is too large"
   static_assert(Size < 5, "Size is too large");
   ^             ~~~~~~~~
<source>:12:20: note: in instantiation of template class 'Vector<int, 16>' requested here
   Vector<int, 16> a1;
```

# 2. Type Trait

Type traits provide ways to query and modify types at compile time.

**Common Type Traits**
Here are some common type traits and their purposes:

`Type Information`:
- std::is_integral<T>: Checks if T is an integral type.
- std::is_floating_point<T>: Checks if T is a floating-point type.
- std::is_pointer<T>: Checks if T is a pointer type.
- std::is_array<T>: Checks if T is an array type.

`Type Modifiers`:
- std::remove_cv<T>: Removes const and volatile qualifiers from T.
- std::remove_reference<T>: Removes reference qualifiers from T.
- std::remove_pointer<T>: Removes pointer qualifiers from T.

`Composite Type Traits`:
- std::is_same<T, U>: Checks if T and U are the same type.
- std::is_base_of<Base, Derived>: Checks if Base is a base class of Derived.
- std::is_convertible<From, To>: Checks if From can be implicitly converted to To.

`Property Queries`:
- std::is_const<T>: Checks if T is const-qualified.
- std::is_volatile<T>: Checks if T is volatile-qualified.
- std::is_signed<T>: Checks if T is a signed type.
- std::is_unsigned<T>: Checks if T is an unsigned type.

```cpp
#include <iostream>
#include <type_traits>

template <typename T>
void check_integral() {
    if (std::is_integral<T>::value) {
        std::cout << "T is an integral type.\n";
    } else {
        std::cout << "T is not an integral type.\n";
    }
}

template <typename T, typename U>
void check_same() {
    if (std::is_same<T, U>::value) {
        std::cout << "T and U are the same type.\n";
    } else {
        std::cout << "T and U are not the same type.\n";
    }
}

int main() {
    check_integral<int>();       // T is an integral type.
    check_integral<double>();    // T is not an integral type.
    check_same<int, int>();
    check_same<int, float>();
}
```

# 3. Use them together

Combining static_assert and type traits in C++ allows you to enforce compile-time checks on template parameters or any other types, ensuring that the types meet certain criteria before the code is allowed to compile. This can be very useful for template programming to provide clear and immediate feedback to the developer. If the type or condition is determined at runtime, `static_assert` can not be used directly to do such checks.

```c++
#include <iostream>
#include <type_traits>

template <typename T>
void process(T value) {
    // Static assertion to ensure T is either an integral or floating-point type
    static_assert(std::is_arithmetic<T>::value, "Template parameter T must be an arithmetic type.");

    if constexpr (std::is_integral<T>::value) {
        std::cout << "Processing integral type: " << value << '\n';
    } else if constexpr (std::is_floating_point<T>::value) {
        std::cout << "Processing floating-point type: " << value << '\n';
    }
}

int main() {
    process(42);      // Processing integral type: 42
    process(3.14);    // Processing floating-point type: 3.14
    process("Hello");  // Compilation error
    return 0;
}
```