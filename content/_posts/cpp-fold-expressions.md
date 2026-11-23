---
title: Fold Expressions in C++
author: Joe Chu
date: 2024-05-19 21:01:21
tags: [parameter pack, fold expressions]
categories:
- cpp
---

Since C++17

<!-- more -->

# 1. Introduction

A fold expression is an instruction for the compiler to repeat the operation of an operator over a parameter pack.

# 2. Syntax

| Syntax |  |
|---|---|
| (pack op ...) | Unary right fold |
| (... op pack) | Unary left fold |
| (pack op ... op init) | Binary right fold |
| (init op ... op pack) | Binary left fold |

- op: could be any of the [32 binary operators](https://en.cppreference.com/w/cpp/language/fold). In binary folds, both ops must be the same.
- pack: unexpanded parameter pack.
- init: initial value, neither an unexpanded parameter pack or an operator.

**The opening and closing parentheses are a required part of the fold expression.**

# 3. Expansion

| Syntax |  |
|---|---|
| ($E$ op ...) | ($E_1$ op (... op ($E_{n-1}$ op $E_n$))) |
| (... op $E$) | ((($E_1$ op $E_2$) op ...) op $E_n$) |
| ($E$ op ... op $I$) | ($E_1$ op (... op ($E_{n-1}$ op ($E_n$ op $I$)))) |
| ($I$ op ... op $E$) | (((($I$ op $E_1$) op $E2$) op ...) op $E_n$) |

```c++
template<typename T, typename... Ts>
auto average(T value, Ts... values) {
    auto n = (1. + sizeof...(Ts));
    return ((value / n) + ... + (values / n)); // (init op ... op pack)
}

int main() {
    std::cout << average(1.0, 2.0, 3.0, 4.0, 5.0);
    return 0;
}
```

# 5. Fold Expression with Comma Operator

The comma operator in fold expressions can be used to perform multiple operations in sequence. This is particularly useful when you need to perform side effects or aggregate results while iterating through a parameter pack.

```c++
template<typename Container, typename... Values>
void push(Container& c, Values... values) {
    (c.push_back(std::forward<Values>(values)), ...);
}

int main() {
    std::vector<int> vec{5};
    push(vec, 1, 2, 3);
    for (int v : vec) {
        std::cout << v << "\n";
    }
}
```

A more generalized example would be applying the same function/process to each value in the parameter pack.

```c++
template<typename Function, typename... Ts>
void apply(Function f, Ts... values) {
    (f(std::forward<Ts>(values)), ...);
}

int main() {
    std::vector<int> vec{5};
    auto lm = [&](auto i) {
        vec.push_back(i);
    };

    apply(lm, 1, 2, 3);
    for (auto v : vec) {
        std::cout << v << "\n";
    }
}
```

# 6. Operator Precedence

If the expression used as init or as pack has an operator with precedence below cast at the top level, it must be parenthesized.

```c++
template<typename T, typename... Ts>
auto average(T value, Ts... values) {
    auto n = (1. + sizeof...(Ts));
    // return ((value / n) + ... + values / n); // error, operator "/" has precedence lower than cast.
    return ((value / n) + ... + (values / n));
}
```

Here are some common operators in programming languages that have precedence below the cast operator:

- Assignment Operators:
    - = (Simple assignment)
    - += (Addition assignment)
    - -= (Subtraction assignment)
    - *= (Multiplication assignment)
    - /= (Division assignment)
    - %= (Modulus assignment)
    - and other compound assignment operators


- Conditional (Ternary) Operator:
    - ?: (Ternary operator)

- Logical Operators:
    - && (Logical AND)
    - || (Logical OR)


- Bitwise Operators:
    - & (Bitwise AND)
    - | (Bitwise OR)
    - ^ (Bitwise XOR)

- Comma Operator:
    - , (Comma operator, used for separating expressions or parameters)

# References

- https://en.cppreference.com/w/cpp/language/fold