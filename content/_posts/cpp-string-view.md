---
title: std::string_view
author: Joe Chu
date: 2024-05-07 13:03:28
tags: [cpp]
categories:
- cpp
---

Work with string efficiently.

<!-- more -->


# 1. Basics

`string_view` (which lives in \<string_view\> header) provides read-only access to existing strings (C-style string, std::string or string_view) without making a copy. It acts as an observer, allowing us to view and utilize the string's contents without the need for duplication or alteration.

## 1.1 Initialize with different types of strings

```c++
#include <iostream>
#include <string>
#include <string_view>

int main()
{
    std::string_view s1{"Hello, world!"}; // initialize with C-style string literal
    std::cout << s1 << '\n';

    std::string s{"Hello, world!"};
    std::string_view s2{s};  // initialize with std::string
    std::cout << s2 << '\n';

    std::string_view s3{s2}; // initialize with std::string_view
    std::cout << s3 << '\n';
}
```

## 1.2 Accept different types of strings as parameters

```c++
#include <iostream>
#include <string>
#include <string_view>

void printSV(std::string_view str) {
    std::cout << str << '\n';
}

int main() {
    printSV("Hello, world!"); // call with C-style string literal

    std::string s2{ "Hello, world!" };
    printSV(s2); // call with std::string

    std::string_view s3 { s2 };
    printSV(s3); // call with std::string_view
}
```

# 2. Use string_view safely

If you try the provided examples, you probably won't see any compiler generated warnings. This is typically due to the absence of warning-related flags in the compilation command. Here is the compile command that I use.

```
-std=c++20 -Wpedantic  -Wall -Wextra -Wconversion -O3 -Werror
```

## 2.1 std::string_view to std::string

C++ doesn't allow implicit conversion from `std::string_view` to `std::string` to prevent expensive copy.

However, we can still achieve that by doing:

- 1. Explicitly creating `std::string` with `std::string_view` initializer.
- 2. Using `static_cast` to convert a `string_view` to `string`.

```c++
#include <iostream>
#include <string>
#include <string_view>

void printString(std::string str) {
	std::cout << str << '\n';
}

int main() {
	std::string_view sv{ "Hello, world!" };

	// printString(sv);   // compile error: won't implicitly convert std::string_view to a std::string

	std::string s{ sv }; // okay: we can create std::string using std::string_view initializer
	printString(s);      // and call the function with the std::string

	printString(static_cast<std::string>(sv)); // okay: we can explicitly cast a std::string_view to a std::string
}
```

## 2.2 Dangling viewer

**Make sure it always points to valid objects**

```c++
#include <iostream>
#include <string>
#include <string_view>

std::string getName() {
    std::string s {"Hello World\n"};
    return s;
}

int main() {
    // -----case 1-----
    std::string_view name {getName()}; // name initialized with return value of function
    std::cout << name << '\n'; // undefined behavior

    // -----case 2-----
    std::string_view sv{};
    { // create a nested block
        std::string s{ "Hello, world!" }; // create a std::string local to this nested block
        sv = s; // sv is now viewing s
    } // s is destroyed here, so sv is now viewing an invalid string

    std::cout << sv << '\n'; // undefined behavior
}
```

## 2.3 Return std::string_view safely

Returning a `std::string_view` is not suggested since local variables will be destroyed at the end of the function, leading to invalid string_view. However, we can still achieve that by:

- Returning C-style literals that exist for the entire program.
- Returning a function parameter of type `std::string_view` since it exists in the scope of the caller.

```c++
#include <iostream>
#include <string_view>

std::string_view getBoolName(bool b) {
    if (b)
        return "true";  // return a std::string_view viewing "true"

    return "false"; // return a std::string_view viewing "false"
} // "true" and "false" are not destroyed at the end of the function

std::string_view firstAlphabetical(std::string_view s1, std::string_view s2) {
    return s1 < s2 ? s1: s2; // uses operator?: (the conditional operator)
}

int main() {
    std::cout << getBoolName(true) << ' ' << getBoolName(false) << '\n'; // ok

    std::string a {"World"};
    std::string b {"Hello"};

    std::cout << firstAlphabetical(a, b) << '\n'; // prints "Hello"
}
```

# References
- https://www.learncpp.com/cpp-tutorial/introduction-to-stdstring_view/
- https://www.learncpp.com/cpp-tutorial/stdstring_view-part-2/
