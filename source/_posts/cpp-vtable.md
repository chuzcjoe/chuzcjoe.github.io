---
title: Vtable in C++
author: Joe Chu
date: 2023-12-12 14:13:21
tags: [cpp]
categories:
- cpp
---

Also known as virtual function table, dispatch table.

<!-- more -->

# Introduction

A virtual table is a static array that contains entries for each virtual function. Each entry is a function pointer that points to the most-derived function.

For classes that have virtual functions, a hidden pointer will be added as a member of that class (`*__vptr`)

# Example

For the following example, a diagram indicating different vtables of each class can be shown below. Each `*__vptr` points to a vtable belongs to a class.

Since foo1() is overriden by D1 and foo2() is overriden by D2, D1 vatble and D2 vtable will be updated during compile time, and foo1() in D1 now points to D1::foo1(), foo2() in D2 points to D2::foo2(). However, since D1 didn't implement foo2(), foo2() in D1 vtable still points to Base::foo2(). Same for foo1() in D2.

<p align="center">
    <img src="vtable.png" title="A regular image" width="800px" height="350px">
</p>

```c++
class Base
{
public:
    virtual void foo1() {
        std::cout << "Base foo1()\n";    
    }
    
    virtual void foo2() {
        std::cout << "Base foo2()\n";
    }
};

class D1: public Base
{
public:
    void foo1() override {
        std::cout << "D1 foo1()\n";    
    }
};

class D2: public Base
{
public:
    void foo2() override {
        std::cout << "D2 foo2()\n";    
    }
};

int main() {
    Base* b1 = new D1;
    Base* b2 = new D2;
    b1->foo1();
    b2->foo2();
    delete b1;
    delete b2;
}
```

```
D1 foo1()
D2 foo2()
```

# References
- https://www.learncpp.com/cpp-tutorial/the-virtual-table/