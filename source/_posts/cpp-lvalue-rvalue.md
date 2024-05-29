---
title: lvalue, rvalue and their references
author: Joe Chu
date: 2024-05-25 21:05:40
tags: [lvalue, rvalue]
categories:
- cpp
---

Understanding lvalue, rvalue, their references and const references.

<!-- more -->


# 1. Introduction

- An lvalue refers to an object that occupies some identifiable location in memory (it has an address). Typically, lvalues are variables or objects that you can assign values to.  It represents an object that persists beyond a single expression. 
**(Persistent Memory Location, Identifiable Address, Modifiable)**

</br>

- An rvalue on the other hand, is a temporary object that does not persist beyond the expression that uses it. Rvalues typically do not have a persistent memory location. 
**(Temporary Storage, No Identifiable Address, Immutable in Context)**

</br>

- An lvalue reference is a reference that binds to an lvalue. Marked as `&`.
```c++
const int y{5};
int& invalidRef{y};  // invalid: can't bind to a non-modifiable lvalue
int& invalidRef2{0}; // invalid: can't bind to an rvalue
```

</br>

- An rvalue reference is a reference that binds to an rvalue. Marked as `&&`.

</br>

- A const lvalue reference is a reference that can bind to both `lvalues and rvalues`, providing an efficient way to access an object without modifying it.
```c++
const int y{5};
int x{3};
const int& ref1{y}; // ok, bind to a const lvalue.
const int& ref2{x}; // ok, bind to a modifiable lvalue.
const int& ref3{3}; // ok, bind to a rvalue.
```

# 2. More

## 2.1 Const lvalue refernce extends the lifetime of temporary objects
```c++
int main() {
    const int& ref{5}; // The temporary object 5 has its lifetime extended to the end of the main function.
    std::cout << ref << '\n'; // Therefore, we can safely use it here
    return 0;
} // Both ref and the temporary object release here
```

## 2.2 Const lvalue references accept both lvalue and rvalue
```c++
class LargeObject {
public:
    std::string data;
    LargeObject(const std::string& str) : data(str) {}
};

void processObject(const LargeObject& obj) {
    std::cout << "Processing: " << obj.data << std::endl;
}

int main() {
    LargeObject obj("Large data");
    processObject(obj);       // Passes an lvalue
    processObject(LargeObject("Temporary large data")); // Passes an rvalue
    return 0;
}
```

## 2.3 Passing lvalues to rvalue reference

An rvalue reference is designed to bind to temporary objects (rvalues) that are about to be destroyed, allowing the program to safely "move" resources from those objects. However, there are situations where you might want to pass an lvalue to a function that takes an rvalue reference. This is where the std::move utility comes into play.
```c++
// Function that takes an rvalue reference
void processVector(std::vector<int>&& vec) {
    std::cout << "Processing vector of size: " << vec.size() << std::endl;
}

int main() {
    std::vector<int> myVector = {1, 2, 3, 4, 5};
    // Pass lvalue to function expecting rvalue reference
    processVector(std::move(myVector));
    // myVector can still be used, but its content is unspecified
    std::cout << "After move, myVector size: " << myVector.size() << std::endl;
    return 0;
}
```

## 2.4 Function overloading priority

Based on what we've learned, both `rvalue references` and `const lvalue references` can accept passed rvalues. However, if we have an overloaded function with these two as arguments and we pass an rvalue, which one will the compiler call? The rule for overload resolution is: **exact match > rvalue reference overload > const lvalue reference overload**.
```c++
void f(const int& x) {
    std::cout << "const lvalue reference\n";
}

void f(int&& x) {
    std::cout << "rvalue reference\n";
}

int main() {
    f(3);
    return 0;
}
```

## 2.5 Constexpr lvalue references

Since `constexpr` will evaluate expressions during compile time, when it applies to lvalue references, it can only bind to either global or static objects. This usage is pretty rare and has its limitations. We will not dive deep into this topic.
```c++
int g_x{5};

int main()
{
    [[maybe_unused]] constexpr int& ref1 {g_x}; // ok, can bind to global

    static int s_x {6};
    [[maybe_unused]] constexpr int& ref2 {s_x}; // ok, can bind to static local

    int x { 6 };
    [[maybe_unused]] constexpr int& ref3 {x}; // compile error: can't bind to non-static object

    return 0;
}
```

# 3. Universal References

Universal references in C++ refer to a special type of reference that can bind to both lvalues and rvalues. This concept was introduced with C++11 and is commonly associated with template programming. Sometimes, it is also called forwarding reference.

Universal referenes are declared as `T&&` in templates.
```cpp
template<typename T>
void f(T&& param)
```

The actual type of `param` is determined by how function f is called.
- param is an lvalue reference if f receives an lvalue.
- param is an rvalue reference if f receives an rvalue.

Universal references are often used to implement perfect forwarding in order to preserve the `lvalue\rvalue` nature of the arguments.
```cpp
template<typename T>
void f(T&& param) {
    g(std::forward<T>(param));
}
```

In the following code, `x` in the context of `f(T&& x)` is an lvalue. This might be a little bit tricky at first sight. But whether `x` is an lvalue or rvalue really depends on the context we are referring to. In the context of the caller that calls `f`, for sure `x` would be an rvalue reference. 

If we directly call `g(x)` inside `f`, no matter we pass an lvalue or an rvalue to `f`, eventually, `void g(int& x)` will be called since `x` inside `f` is always an lvalue. That's why we need perfect forwarding here to make sure `g` gets exactly what passed to `f`.
```cpp
// Overload g for lvalue references
void g(int& x) {
    std::cout << "g received an lvalue reference\n";
}

// Overload g for rvalue references
void g(int&& x) {
    std::cout << "g received an rvalue reference\n";
}

template<typename T>
void f(T&& x) {
    // Forward the argument to g, preserving its value category
    // g(std::forward<T>(x));
    g(x);
}

int main() {
    int a = 1;
    f(a);
    f(1);
    return 0;
}
```

# References

- https://www.fluentcpp.com/2018/02/06/understanding-lvalues-rvalues-and-their-references/