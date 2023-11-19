---
title: constexpr specifier
author: Joe Chu
date: 2023-11-15 21:47:03
tags: [cpp]
categories:
- cpp
---

The constexpr specifier declares that it is possible to evaluate the value of the function or variable at compile time.

<!-- more -->

# Example

```c++
#include <iostream>

constexpr int accumSum(int n) {
    if (n == 1) return 1;
    return n + accumSum(n-1);
}

int main () {
    int a = accumSum(10); // evaluate during runtime
}
```

Try you code on [compiler explorer](https://godbolt.org/)

<p align="center">
    <img src="example1.png" title="A regular image" width="800px" height="200px">
</p>

On the right side, the assembly code shows that the program calls `accumSum(int)` function explicitly during runtime.

If we add `constexpr` when declaring `a`, we can see the function call does not appear in the assembly code.

<p align="center">
    <img src="example2.png" title="A regular image" width="800px" height="200px">
</p>

# const vs constexpr
- **const** can be deferred at runtime.
- **constexpr** must be evaluated at compile time. All `constexpr` variables are `const`.

```c++
constexpr int x = 1; // OK
constexpr int y = 2 * 3; // OK
constexpr int z; // Error
int i = 0;
constexpr int j = i + 1; // Error, i is not constexpr
```

# constexpr in OOP
```c++
class Base {
private:
    int m_i;
public:
    constexpr Base(int i) : m_i(i) {}
    
    // A read-only function, can not change any non-static data or call any member functions that aren't constant
    constexpr int getVal() const { 
        return m_i;
    }
};

int main() {
    constexpr Base b(5);
    constexpr int x = b.getVal();
    std::cout << "x: " << x << std::endl;
}
```

# References
- https://en.cppreference.com/w/cpp/language/constexpr
- https://learn.microsoft.com/en-us/cpp/cpp/constexpr-cpp?view=msvc-170