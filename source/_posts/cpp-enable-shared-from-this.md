---
title: std::enable_shared_from_this
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
date: 2024-07-11 23:14:50
tags: [cpp]
categories:
- cpp
---

Safe ownership management.

<!-- more -->

# 1. Introduction

`std::enable_shared_from_this` is a standard library utility in C++ that helps manage `std::shared_ptr` instances. It allows an object to create a shared pointer (std::shared_ptr) that shares ownership of the object. This can be particularly useful when you want to ensure that a class instance can generate shared pointers to itself without creating multiple std::shared_ptr instances that manage the same object.

**Key Features**
1. The class that wants to use this utility should inherit from `std::enable_shared_from_this<T>`.
2. This class provides a member function `shared_from_this()`, which returns a std::shared_ptr to the object.
3. It ensures that no multiple `std::shared_ptr` instances try to manage the same object, preventing potential undefined behavior.

```cpp
#include <iostream>
#include <memory>

class A : public std::enable_shared_from_this<A> {
public:
    A() {
        std::cout << "A constructor" << std::endl;
    }

    ~A() {
        std::cout << "A destructor" << std::endl;
    }

    std::shared_ptr<A> getShared() {
        // Use shared_from_this() to create a shared_ptr that shares ownership with the existing shared_ptr
        return shared_from_this();
    }
};

int main() {
    // Create a shared_ptr to A
    std::shared_ptr<A> ptr1 = std::make_shared<A>();

    // Create another shared_ptr using shared_from_this()
    std::shared_ptr<A> ptr2 = ptr1->getShared();

    // Both ptr1 and ptr2 share ownership of the same object
    std::cout << "ptr1 use_count: " << ptr1.use_count() << std::endl; // Output: 2
    std::cout << "ptr2 use_count: " << ptr2.use_count() << std::endl; // Output: 2

    return 0;
}
```

A bad attempt to achieve the same thing without using `std::enable_shared_from_this` could be:
```cpp
#include <iostream>
#include <memory>

struct B
{
    std::shared_ptr<B> getptr()
    {
        return std::shared_ptr<B>(this);
    }
    ~B() { std::cout << "B::~B() called\n"; }
};

int main() {
    // each shared_ptr thinks it's the only owner of the object
    std::shared_ptr<B> b1 = std::make_shared<B>();
    std::shared_ptr<B> b2 = b1->getptr();
    return 0;
}
```
```
double free or corruption (out)
Program terminated with signal: SIGSEGV
```

# 2. Example

In the observer pattern, we want observers to hold shared pointers to the same subject.

```cpp
#include <iostream>
#include <memory>
#include <vector>

class Subject;

class Observer {
public:
    void observe(const std::shared_ptr<Subject>& subject) {
        subject_ = subject;
    }
    void notify() {
        if (auto spt = subject_.lock()) {
            std::cout << "Subject is still alive\n";
        } else {
            std::cout << "Subject has been destroyed\n";
        }
    }
private:
    std::weak_ptr<Subject> subject_;
};

class Subject : public std::enable_shared_from_this<Subject> {
public:
    void addObserver(const std::shared_ptr<Observer>& observer) {
        observers_.push_back(observer);
        observer->observe(shared_from_this());
    }
    void notifyObservers() {
        for (auto& observer : observers_) {
            observer->notify();
        }
    }
private:
    std::vector<std::shared_ptr<Observer>> observers_;
};

int main() {
    auto subject = std::make_shared<Subject>();
    auto observer1 = std::make_shared<Observer>();
    auto observer2 = std::make_shared<Observer>();

    subject->addObserver(observer1);
    subject->addObserver(observer2);

    subject->notifyObservers();  // Outputs: Subject is still alive

    subject.reset();  // Destroy the subject

    observer1->notify();  // Outputs: Subject has been destroyed
    observer2->notify();  // Outputs: Subject has been destroyed

    return 0;
}
```
```
Subject is still alive
Subject is still alive
Subject has been destroyed
Subject has been destroyed
```

# References

- https://en.cppreference.com/w/cpp/memory/enable_shared_from_this