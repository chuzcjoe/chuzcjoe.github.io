---
title: RTTI (Run-Time Type Information)
author: Joe Chu
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: /img/me.jpeg
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
  - position: left
    type: categories
date: 2024-07-23 00:14:52
tags: [rtti]
categories:
- cpp
---

Run-time type information (RTTI) is a mechanism that allows the type of an object to be determined at runtime. 

<!-- more -->

# 1. Key Components of RTTI

The `dynamic_cast` operator.
- Used for conversion of polymorphic types.

The `typeid` operator.
- Used for identifying the exact type of an object.

The `type_info` class.
- Used to hold the type information returned by the typeid operator.

# 2. typeid operator

The `typeid` operator is used to obtain type information about an expression. It returns a reference to a type_info object that represents the type of the expression.

```cpp
#include <iostream>
#include <typeinfo>

class Base {};
class Derived : public Base {};

int main() {
    Base* b = new Derived();
    std::cout << typeid(*b).name() << std::endl;
    delete b;
    return 0;
}
```
```
4Base // Output is a compiler-dependent mangled name
```

In this code, `typeid(*b).name()` is used to get the name of the type of the object that b points to. However, since `Base` does not have any virtual functions, it is not a polymorphic base class. For non-polymorphic classes, `typeid` performs a compile-time type check rather than a runtime type check. This means that `typeid(*b)` will return the type information for `Base`, not `Derived`, even though b points to a `Derived ` object.

To get the `Derived` class, we need to make `Base` a polymorphic class by adding at least one virtual function.  In this example, adding a virtual destructor to the Base class results in the creation of static vtables for both the Base and Derived classes. When the statement Base* b = new Derived(); is executed, b actually points to a Derived object. This is because of a hidden pointer, known as the vptr, which points to the vtable of the Derived class.

More details on vtable: https://chuzcjoe.github.io/2023/12/12/cpp-vtable/
```cpp
#include <iostream>
#include <typeinfo>

class Base {
public:
    virtual ~Base() {}
};
class Derived : public Base {};

int main() {
    Base* b = new Derived();
    std::cout << typeid(*b).name() << std::endl;
    delete b;
    return 0;
}
```
```
7Derived // Output is a compiler-dependent mangled name
```

# 3. dynamic_cast operator

The `dynamic_cast` operator in C++ is used for safely converting pointers and references to classes up, down, and sideways within an inheritance hierarchy. It is primarily used in situations where you need to ensure that a cast is valid at runtime, especially when dealing with polymorphic types.

`dynamic_cast` only works with `polymophic` classes, which are classes that contain at least one virtual function. This ensures that the class has a vtable that `dynamic_cast` can use to determine the actual type of the object at runtime.


**Downcasting**
Converting a Base pointer to a Derived pointer in order to access some Derived class specific members.
```cpp
#include <iostream>

class Base {
public:
    virtual ~Base() {}  // Virtual destructor makes Base polymorphic
};

class Derived : public Base {
public:
    void show() { std::cout << "Derived class method" << std::endl; }
};

int main() {
    Base* basePtr = new Derived();
    Derived* derivedPtr = dynamic_cast<Derived*>(basePtr);
    if (derivedPtr) {
        derivedPtr->show();  // Safe to call Derived methods
    } else {
        std::cout << "Invalid cast" << std::endl;
    }
    delete basePtr;
    return 0;
}
```
```
Derived class method
```

If we do:
```cpp
Base* basePtr = new Base();
Derived* derivedPtr = dynamic_cast<Derived*>(basePtr);
```
It will return `Invalid cast` because `dynamic_cast` performs a type-safe downcast, which means it only succeeds if the object being cast is actually of the derived type (or a type derived from it). Here, the object is not of the derived type, so the cast returns `nullptr`.

**Upcasting**
Converting a `Derived` pointer to `Base` pointer. This operation is implicitly supported in C++ and does not involve `RTTI`. However, we can still use `dynamic_cast`.
```cpp
Derived* dPtr = new Derived();
Base* bPtr = dynamic_cast<Base*>(dPtr);
```

**Sidecasting**
Casting between sibling classes within a class hierarchy. It requires that both the source and target types must inherit from a common base class that has at least one virtual function. This makes the base class polymorphic, enabling `RTTI` to work correctly. Sidecasting is less common, if you find yourself using sidecasting a lot, you may need to re-design your class hierarchy.Sidecasting is less common

# 4. Use cases of RTTI

- Type-Safe Downcasting: Ensuring that a cast from a base class pointer/reference to a derived class pointer/reference is valid.
- Object Type Identification: Determining the actual type of an object at runtime.