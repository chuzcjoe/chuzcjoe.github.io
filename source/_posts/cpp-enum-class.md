---
title: Enum Class
author: Joe Chu
date: 2024-05-08 21:11:42
tags: [cpp]
categories:
- cpp
---

Choose enum class over enum for type safety.

<!-- more -->

# 1. Overview

Enum class is introduced in C++11. Compared to traditional Enum, it shows differences in:

- Scope
- Underlying types
- Type safety
- Enum constants

# 2. Scope

- enum defines an enumeration in the global scope, enum values are directly accessible without any scope qualification, meaning its enumerators can potentially clash with other names in the same scope.
- enum class introduces scoped enumerations. Enumerators inside an enum class are scoped to the enumeration, reducing the risk of naming conflicts.

```c++
enum class Color {
    Red,
    Green,
    Blue
};

int main() {
    Color myColor = Color::Red; // Enum value is scoped.
    std::cout << static_cast<int>(myColor) << std::endl; // Prints 0 (Red)
}
```

# 3. Underlying types

- By default, enum uses int as the underlying type for its enumerators. This can lead to unintended conversions and comparison issues.
- enum class requires an explicitly specified underlying type, preventing implicit conversions and providing stronger type safety.

```c++
enum Color1 {
    Red,
    Green,
    Blue
};

enum class Color2 : short {
    Red,
    Green,
    Blue
};

int main() {
    std::cout << sizeof(Color1) << std::endl; // 4, Size is implementation-dependent.
    std::cout << sizeof(Color2) << std::endl; // 2
}
```

# 4. Type safety

- enum does not provide strong type safety. Enumerators are implicitly convertible to integers and can lead to unintended behavior.
- enum class enhances type safety by encapsulating enumerators within the scope of the enumeration. Enumerators are not implicitly convertible to integers, reducing potential bugs.

```c++
enum class Color {
    Red,
    Green,
    Blue
};

int main() {
    Color myColor = Color::Green;
    if (myColor == 1) { // error, no match for 'operator==' (operand types are 'Color' and 'int')
        std::cout << "color match\n";
    }
}
```

# 5. Enum constants

- enum constants can be defined with any valid integer value, including duplicates and values outside the declared range.
- enum class constants are strongly enforced to be unique within the scope and adhere to the underlying type’s range.

# References

- https://agrawalsuneet.github.io/blogs/enum-vs-enum-class-in-c++/
- https://en.cppreference.com/w/cpp/language/enum