---
title: Virtual Inheritance
author: Joe Chu
date: 2024-06-02 21:17:28
tags: [inheritance]
categories:
- cpp
---

Solve diamond problem.

<!-- more -->

# 1. Introduction

Virtual inheritance is used to solve the diamond problem in multiple inheritance. A typical diamond problem is: when a class inherits two classes that both inherit from a common base class. Without the virtual inheritance, the common base class is duplicated, causing compiler ambiguity when accessing base class members or functions.

```
(left) without virtual inheritance
(right) with virtual inheritance

 A   A        A
 |   |       / \
 B   C      B   C
  \ /        \ /
   D          D
```

# 2. Examples

## 2.1 Without virtual inheritance

We keep two instances of base class `A`. To avoid compiler ambiguity, we need to use scope resolution operator(::) to access a specific instance of `A`.

```cpp
class A {
public:
    int value = 0;
};

class B : public A {
};

class C : public A {
};

class D : public B, public C {
};

int main() {
    D obj;
    // obj.value; // Error: ambiguous access
    obj.B::value = 1; // Access value through B's A
    obj.C::value = 2; // Access value through C's A

    std::cout << "obj.B::value: " << obj.B::value << std::endl;
    std::cout << "obj.C::value: " << obj.C::value << std::endl;

    return 0;
}
```

## 2.2 With virtual inheritance

Virtual inheritance ensures that there is only one instance of the common base class, shared by all derived classes. A virtual base pointer (`vptr`) is used to point to the shared instance of the base class.

```cpp
class A {
public:
    int value = 0;
};

class B : virtual public A {
};

class C : virtual public A {
};

class D : public B, public C {
};

int main() {
    D obj;
    obj.value = 1;
    std::cout << "obj.value: " << obj.value << std::endl;
    obj.value = 2;
    std::cout << "obj.value: " << obj.value << std::endl;

    return 0;
}
```

## 2.3 Contructor initialization

When using virtual inheritance, the most derived class is responsible for initializing the base class.
```cpp
class A {
public:
    int value;
    A(int val) : value(val) {
        std::cout << "A(int) called with val = " << val << std::endl;
    }
};

class B : virtual public A {
public:
    B() : A(0) { // Provide a default value to A
        std::cout << "B() called" << std::endl;
    }
};

class C : virtual public A {
public:
    C() : A(0) { // Provide a default value to A
        std::cout << "C() called" << std::endl;
    }
};

class D : public B, public C {
public:
    D(int val) : A(val), B(), C() { // Initialize A with a specific value
        std::cout << "D(int) called with val = " << val << std::endl;
    }
};

int main() {
    D obj(5);
    std::cout << "obj.value: " << obj.value << std::endl;
    return 0;
}
```

```
A(int) called with val = 5
B() called
C() called
D(int) called with val = 5
obj.value: 5
```
