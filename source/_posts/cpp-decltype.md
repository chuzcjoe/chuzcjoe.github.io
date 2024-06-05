---
title: decltype specifier
author: Joe Chu
date: 2024-05-29 15:10:22
tags: [decltype]
categories:
- cpp
---

Since C++11

<!-- more-->

# 1. Value Category



<p align="center">
    <img src="values.png" title="A regular image" width="300px" height="300px">
</p>

- Three **primary value categories:** prvalue, xvalue, and lvalue.
- Two **mixed categories:** glvalue, value.

| Category | Definition |
|---|---|
| lvalue | Represents an object that occupies a specific location in memory |
| rvalue | Temporary value without a persistent memory address. |
| glvalue <br>(generalized lvalue) | Represents an expression that refers to a memory location. |
| xvalue <br> (expiring value) | Represents an object that is about to be moved from. It denotes an object whose resources can be reused. |
| prvalue <br> (pure rvalue) | Represents a temporary value that does not have a memory location. It is used to initialize objects. |

The concept of `xvalue` can be really confusing. Here are some common scenarios where `xvalue` is relevant.

```cpp
int&& foo() {
    int x = 42;
    return std::move(x); // std::move(x) is an xvalue
}

struct A {
    A() {}
};

int main() {
    /*
    Example 1: using std::move() to cast a lvalue to rvalue reference.
    */
    int x = 10;
    int&& a = std::move(x); // std::move(x) is an xvalue

    /*
    Example 2: Function Returning an rvalue Reference.
    */
    int&& b = foo(); // foo() is an xvalue

    /*
    Example 3: Temporary objects in expressions when they are cast to rvalue references.
    */
    A&& c = A();

    /*
    Example 4: cast literals to rvalue references
    */
    int&& d = static_cast<int&&>(5);

    return 0;
}
```

**Why does xvalue belong to both glvalue and rvalue?**

Here are two explanations:

- `Resource reuse`: An xvalue represents an object whose resources can be reused, typically because it is about to go out of scope or is explicitly marked for resource transfer. This makes xvalue similar to an rvalue, which represents temporary objects that can be moved or copied from.

- `Memory location`: Despite being suitable for resource transfer, an xvalue still refers to a specific location in memory, just like an lvalue. We can still  take the address of an xvalue and use it to access the object's memory.


# 2. decltype

The `decltype` specifier is used to query the type of an expression. Its syntax can be:

- **decltype(entity)**
- **decltype(expression)**

Based on the explanation in [cppreference](https://en.cppreference.com/w/cpp/language/decltype), we have two categories for using decltype.

1. If the argument is an unparenthesized id-expression or an unparenthesized class member access expression, then decltype yields the type of the entity named by this expression. If there is no such entity, or if the argument names a set of overloaded functions, the program is ill-formed.
```cpp
int foo() {
    return 3;
}

struct E {
    double m;
};

void func(int) {}
void func(double) {}

int main() {
    /*
    Example 1: variable
    */
    int a = 42;
    decltype(a) b = 5; // b has type int because a is an int
    std::cout << "Type of b: " << typeid(b).name() << '\n';

    /*
    Example 2: function
    */
    decltype(foo()) d = foo();
    std::cout << "Type of d: " << typeid(d).name() << '\n';

    /*
    Example 3: member variable
    */
    E e;
    decltype(e.m) f = 1.;
    std::cout << "Type of f: " << typeid(f).name() << '\n';

    /*
    Example 4: overloaded functions
    */
    decltype(func) g; // Error, overloaded functions

    return 0;
}
```

2. If the argument is any other expression of type T, and
    a) *if the value category of expression is xvalue, then decltype yields T&&;*
    b) *if the value category of expression is lvalue, then decltype yields T&;*
    c) *if the value category of expression is prvalue, then decltype yields T.*
```cpp
int main() {
    /*
    Example 1: xvalue
    */
    int a = 1;
    decltype(std::move(a)) b = 3;
    std::cout << "Type of b: " << typeid(b).name() << '\n';

    /*
    Example 2: lvalue
    */
    int c = 3;
    decltype(c) d1 = c;      // x is an lvalue, decltype(x) is int
    decltype((c)) d2 = c;    // (x) is an lvalue expression, decltype((x)) is int&

    /*
    Example 3: prvalue
    */
    int e = 42;
    decltype(42) f1 = 42;       // f1 is int
    decltype(e + 1) f2 = e + 1; // f2 is int
}
```

# 3. Parenthesized VS Unparenthesized

If the name of an object is parenthesized, it is treated as an ordinary lvalue expression.

- When `decltype` is used with an **unparenthesized** expression, it simply yields the type of the named entity.
- When `decltype` is used with a **parenthesized** expression, it yields a type based on the value category of the expression inside the parentheses.
```cpp
int x = 42;
int& lref = x; // lvalue reference to x
int&& rref = 42; // rvalue reference to a temporary int

// Unparenthesized expressions
decltype(x) a = 5; // a is int
decltype(lref) b = x; // b is int&, because lref is an lvalue reference

// Parenthesized expressions
decltype((x)) c = x; // c is int& because (x) is an lvalue
decltype((lref)) d = x; // d is int& because (lref) is an lvalue
```

To summarize, for parenthesized expression, it yields the type of the named entity.. For unparenthesized expression, it yields a type based on the value category of the expression inside the parentheses.

# References

- https://en.cppreference.com/w/cpp/language/value_category
- https://en.cppreference.com/w/cpp/language/decltype