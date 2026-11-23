---
title: Object Slicing
author: Joe Chu
date: 2023-12-09 19:01:12
tags: [cpp]
categories:
- cpp
---

Slicing in C++ and how to prevent it.

<!-- more -->

# Introduction

In C++, when a derived class object is assigned to a base class object, the fields and methods in the derived class object will be sliced off. Since these extra components are not used, the priority is given to base class. The following example shows how slicing happens.

```c++
class Base {
public:
    Base() {
        std::cout << "Base() called\n";
    }
    
    Base(Base& obj) {
        std::cout << "Base(Base& obj) called\n";    
    }
    
    virtual void getName() const {
        std::cout << "Base getName()\n";    
    }
};

class Derived : public Base {
public:
    Derived() {
        std::cout << "Derived() called\n";    
    }
    
    void getName() const override {
        std::cout << "Derived getName()\n";    
    }
};


int main() {
    Base b;
    Derived d;
    
    std::cout << "--------\n";
    
    b = d;
    b.getName();
    
    return 0;
}
```

```
Base() called
Base() called
Derived() called
--------
Base getName()
```

Let's take a look at another example. When a vector holds `Base` type, however `Derived` objects are pushed to the vector, object slicing will occur.

```c++
class Base {
public:
    Base() {
        std::cout << "Base() called\n";
    }
    
    Base(const Base& obj) {
        std::cout << "Base(Base& obj) called\n";    
    }
    
    virtual void getName() const {
        std::cout << "Base getName()\n";    
    }
};

class Derived : public Base {
public:
    Derived() {
        std::cout << "Derived() called\n";    
    }
    
    void getName() const override {
        std::cout << "Derived getName()\n";    
    }
};


int main() {
    std::vector<Base> vec;
    
    Derived d;
    vec.push_back(d); // 1. Base b = d; 2. Base(const Base& obj)
    
    vec[0].getName();
    
    return 0;
}
```

```
Base() called
Derived() called
Base(Base& obj) called
Base getName()
```

The solutions to this problem is either using reference or pointer.

# Use references

```c++
class Base {
public:
    Base() {
        std::cout << "Base() called\n";
    }
    
    Base(const Base& obj) {
        std::cout << "Base(Base& obj) called\n";    
    }
    
    virtual void getName() const {
        std::cout << "Base getName()\n";    
    }
};

class Derived : public Base {
public:
    Derived() {
        std::cout << "Derived() called\n";    
    }
    
    void getName() const override {
        std::cout << "Derived getName()\n";    
    }
};


int main() {
    Derived d;
    Base& b = d;
    b.getName();
    
    return 0;
}
```

```
Base() called
Derived() called
Derived getName()
```

`Note` that **std::vector<Base&> vec;** is not legal. Containers like std::vector manage memory for their elements, and they assume ownership of the objects stored in them. Objects stored in a container need to be owned by the container to ensure proper memory management. References, on the other hand, do not own the objects they refer to. They are just aliases or alternative names for existing objects. Allowing a container to hold references could lead to dangling references if the original objects are destroyed while the container still holds references to them.

# Use Pointers

A better way to prevent object slicing is to use pointers.

```c++
class Base {
public:
    Base() {
        std::cout << "Base() called\n";
    }
    
    Base(const Base& obj) {
        std::cout << "Base(Base& obj) called\n";    
    }
    
    virtual void getName() const {
        std::cout << "Base getName()\n";    
    }
};

class Derived : public Base {
public:
    Derived() {
        std::cout << "Derived() called\n";    
    }
    
    void getName() const override {
        std::cout << "Derived getName()\n";    
    }
};


int main() {
    std::vector<Base*> vec;
    
    Derived d;
    vec.push_back(&d);
    vec[0]->getName();
    
    return 0;
}
```

```
Base() called
Derived() called
Derived getName()
```

# References
- https://www.geeksforgeeks.org/object-slicing-in-c/
- https://www.youtube.com/watch?v=qe5s9oTsY0s
- https://www.youtube.com/watch?v=99xTGkdxAdc&t=2s