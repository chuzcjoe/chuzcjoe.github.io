---
title: Avoid Naked Union
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
date: 2025-01-25 09:44:06
tags: [union]
categories:
- cpp
---

To ensure safety, encapsulate the union within a class or struct.

<!-- more -->

# 1. Naked Union

A naked union is not encapsulated within a class or struct.

```cpp nakedUnion.cpp
union NakedUnion {
    int intValue;
    float floatValue;
    char charValue;
};
```

**Explanation of risks**
1. Undefined behavior
    - Only one member of the union should be active at a time. Accessing an inactive member results in undefined behavior.
2. No type safety
    - A naked union does not track which member is currently active. If you accidentally access the wrong member, the program may produce incorrect results or crash.

# 2. Ecapsulation with class/struct

To mitigate the risk, we can wrap the union in a class or struct and use an `enum` to track the active member.

```cpp safeUnion.cpp
class SafeUnion {
public:
    enum Type { INT, FLOAT, CHAR };
    Type activeType;

    union {
        int intValue;
        float floatValue;
        char charValue;
    };

    void setInt(int value) {
        intValue = value;
        activeType = INT;
    }

    void setFloat(float value) {
        floatValue = value;
        activeType = FLOAT;
    }

    void setChar(char value) {
        charValue = value;
        activeType = CHAR;
    }

    void print() const {
        switch (activeType) {
            case INT: std::cout << "intValue: " << intValue << std::endl; break;
            case FLOAT: std::cout << "floatValue: " << floatValue << std::endl; break;
            case CHAR: std::cout << "charValue: " << charValue << std::endl; break;
        }
    }
};
```

# 3. Use std::variant

`std::variant` provides a type-safe alternative to unions.

```cpp
#include <iostream>
#include <variant>

int main() {
    // Define a variant that can hold an int, float, or std::string
    std::variant<int, float, std::string> v;

    // Assign different types to the variant
    v = 42; // holds an int
    v = 3.14f; // holds a float
    v = "Hello, World!"; // holds a std::string

    // Check what type the variant currently holds
    if (std::holds_alternative<int>(v)) {
        std::cout << "The variant holds an int: " << std::get<int>(v) << std::endl;
    } else if (std::holds_alternative<float>(v)) {
        std::cout << "The variant holds a float: " << std::get<float>(v) << std::endl;
    } else if (std::holds_alternative<std::string>(v)) {
        std::cout << "The variant holds a string: " << std::get<std::string>(v) << std::endl;
    }

    return 0;
}
```

# 4. Summary

- Naked unions are powerful but risky because they lack type safety and can lead to undefined behavior.

- Always be cautious when using naked unions and prefer safer alternatives like encapsulation or `std::variant`.

- If you must use naked unions, document the code clearly and ensure that only one member is accessed at a time.