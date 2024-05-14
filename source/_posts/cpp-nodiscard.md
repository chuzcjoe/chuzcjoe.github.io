---
title: nodiscard in C++
author: Joe Chu
date: 2024-04-14 23:59:23
tags: [cpp]
categories:
- cpp
---

Introduced in C++17

<!-- more -->

# 1. Introduction

Checkout how the declaration of `std::vector<T, Allocator>::empty` changes over different C++ versions. Why is it important and how should we use it?

<p align="center">
    <img src="nodiscard.png" title="A regular image" width="600px" height="300px">
</p>

`[[nodiscard]]` is a new attribute introduced in C++17. It can be appended to either a function signiture or type declaration to specify that the return value is important and should not be discarding. The compiler will shows warnings if we ignore the return value.

# 2. Function

Use `nodiscard` as function signiture.

```c++
#include <iostream>
#include <coroutine>

struct Vector {
    int* data;
    int size;

    Vector(int n) : size(n) {
        data = new int[n];
    }
    ~Vector() {
       delete[] data;
       data = nullptr; 
    }
    [[nodiscard("you might want to call clear()")]] bool empty() const {
        return size == 0 ? true : false;
    }

    void clear() {
        delete[] data;
        data = new int[0];
        size = 0;
    }
};

int main() {
    Vector vec(5);
    vec.empty();
}
```
Console message:
```
<source>: In function 'int main()':
<source>:28:14: warning: ignoring return value of 'bool Vector::empty() const', declared with attribute 'nodiscard': 'you might want to call clear()' [-Wunused-result]
   28 |     vec.empty();
      |     ~~~~~~~~~^~
<source>:15:58: note: declared here
   15 |     [[nodiscard("you might want to call clear()")]] bool empty() const {
      |
```

This is a common misuse of the `empty()` method. The purpose might seem to empty the vector's contents, but the correct method to use is `clear()`. In this instance, the [[nodiscard]] attribute warns the compiler that the return value from `empty()` should not be ignored, highlighting its importance. From C++20 onwards, it's possible to include a custom message within the [[nodiscard]] attribute, which can help explicitly point out this kind of issue in the code.

# 3. Type declaration

```c++
#include <iostream>

enum class [[nodiscard("This is an error type, you might want to capture the return value")]] ErrorType {
    Error,
    Warning,
    Ok
};

ErrorType doSomethingOk();

int main() {
    doSomethingOk();
}
```
Console output:
```
<source>: In function 'int main()':
<source>:12:18: warning: ignoring returned value of type 'ErrorType', declared with attribute 'nodiscard': 'This is an error type, you might want to capture the return value' [-Wunused-result]
   12 |     doSomethingOk();
      |     ~~~~~~~~~~~~~^~
<source>:9:11: note: in call to 'ErrorType doSomethingOk()', declared here
    9 | ErrorType doSomethingOk();
      |           ^~~~~~~~~~~~~
<source>:3:95: note: 'ErrorType' declared here
    3 | enum class [[nodiscard("This is an error type, you might want to capture the return value")]] ErrorType {
      |
```

It is important to capture the type of error and execute appropriate actions based on the returned value. Doing so can help avert possible bugs in the code.

# 4. Constructor

Sometimes, instead of applying [[nodiscard]] to an entire type declaration, as in the case above with an ErrorType that indicates the results of execution, we might prefer to specifically apply [[nodiscard]] to constructors.
```c++
std::unique_lock<std::mutex> lock{mu};
int* p = new int;
std::unique_ptr<int> uniPtr{p};
```
In this scenario, constructors for both `unique_lock` and `unique_ptr` are invoked, returning objects that are then used for further operations and resource management. Consider a situation where we create our own class or struct that allocates resources within its constructor. If, in the main function, we call this constructor without assigning the returned object to a variable, the allocated resources would become inaccessible, leading to memory leaks and potential issues with resource management.

Let's reuse the example from section 1.
```c++
#include <iostream>
#include <coroutine>

struct Vector {
    int* data;
    int size;

    [[nodiscard("You are trying to allocate resouces, make sure to assign to an object")]] Vector(int n) : size(n) {
        data = new int[n];
    }
    ~Vector() {
       delete[] data;
       data = nullptr; 
    }
};

int main() {
    Vector{5};
}
```
Console output:
```
<source>: In function 'int main()':
<source>:18:14: warning: ignoring return value of 'Vector::Vector(int)', declared with attribute 'nodiscard': 'You are trying to allocate resouces, make sure to assign to an object' [-Wunused-result]
   18 |     Vector{5};
      |              ^
<source>:8:92: note: declared here
    8 |     [[nodiscard("You are trying to allocate resouces, make sure to assign to an object")]] Vector(int n) : size(n) {
      |
```

Start using `[[nodiscard]]`, you can make your code more robust.


# References
- https://en.cppreference.com/w/cpp/language/attributes/nodiscard