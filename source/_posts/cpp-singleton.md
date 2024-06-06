---
title: Singleton Design Pattern
author: Joe Chu
date: 2024-06-04 19:12:00
tags: [singleton]
categories:
- cpp
---

Design pattern.

<!-- more -->

A Singleton is a design pattern that ensures a class has only one instance and provides a global point of access to that instance.
```cpp
#include <iostream>

class Singleton {
private:
    static Singleton* _instance;

    Singleton() {
        std::cout << "Singleton created\n";
    }

    // Prevent copying
    Singleton(const Singleton& rhs) = delete;
    // Prevent assignment
    Singleton& operator=(const Singleton& rhs) = delete;

public:
    static Singleton* getInstance() {
        if (_instance == nullptr) {
            _instance = new Singleton();
        }
        return _instance;
    }
};

Singleton* Singleton::_instance = nullptr;

int main() {
    Singleton* a = Singleton::getInstance();
    Singleton* b = Singleton::getInstance();
    Singleton* c = Singleton::getInstance();

    std::cout << "Memory addresses of a, b and c: " << a  << ' ' << b << ' ' << c << '\n';
}
```

```
Singleton created
Memory addresses of a, b and c: 0x17662b0 0x17662b0 0x17662b0
```