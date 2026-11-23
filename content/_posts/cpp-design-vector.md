---
title: Design Vector
author: Joe Chu
date: 2023-12-14 22:54:58
tags: [ood]
categories:
- cpp
---

Design a customized vector container.

<!-- more -->

# Introduction

I am launching a fresh blog series dedicated to object-oriented design with C++. The inspiration behind this initiative stems from my job interviews, where over 70% of the positions requiring C++ skills focused on designing scenarios rather than typical leetcode-style problems. This experience highlighted the significance of understanding design patterns and the principles of object-oriented programming (OOP).

Today, we will explore how to design a vector container in C++. Some basic requirements for our customized vector would be:
- pushback(): push an object/element to the end of the vector
- popback(): pop an object/element for the end of the vector
- size(): get the size of the vector
- emplaceback(): contruct an object in-place and push it to the end of the vector
- []: vector indexing
- clear(): deallocate the memory

Other requirements:
- dynamic memory size allocation
- manage all the allocated memory
- adapt to different data types

# Code

**Vector.h**
```c++
#pragma once

#include <new>

template<typename T>
class Vector {
public:
    Vector() {
        ReAlloc(2);
    }

    ~Vector() {
        clear();
        ::operator delete(_data, _capacity * sizeof(T));
    }

    void pushback(const T& value) {
        if (_size >= _capacity) {
            ReAlloc(_capacity + _capacity / 2);
        }
        
        new(&_data[_size]) T(value);
        _size++;
    }

    void pushback(T&& value) {
        if (_size >= _capacity) {
            ReAlloc(_capacity + _capacity / 2);
        }

        new(&_data[_size]) T(std::move(value));
        _size++;
    }

    void popback() {
        if (_size > 0) {
            _size--;
            _data[_size].~T();
        }
    }

    void clear() {
        for (size_t i = 0; i < _size; i++) {
            _data[i].~T();
        }

        _size = 0;
    }

    template <typename... Args>
    T& emplaceback(Args&&... args) {
        if (_size >= _capacity) {
            ReAlloc(_capacity + _capacity / 2);
        }

        // replacement new, construct objetcs in-place
        new(&_data[_size]) T(std::forward<Args>(args)...);

        return _data[_size++];
    }

    T& operator[](size_t index) {
        return _data[index];
    }

    const T& operator[](size_t index) const {
        if (index >= _size) {
            __builtin_trap();
        }
        return _data[index];
    }

    size_t size() const {return _size;}

private:
    void ReAlloc(size_t newCapacity) {
        // 1. allocate a new block of memory
        // 2. copy//move old data into new block
        // 3. delete old data
    
        T* newBlock = (T*) ::operator new(newCapacity * sizeof(T));

        // for downsize the vector
        if (newCapacity < _size) {
            _size = newCapacity;
        }
        for (size_t i = 0; i < _size; i++) {
            new (&newBlock[i]) T(std::move(_data[i]));
        }
        for (size_t i = 0; i < _size; i++) {
            _data[i].~T();
        }

        ::operator delete(_data, _capacity * sizeof(T));
        _data = newBlock;
        _capacity = newCapacity;
    }

private:
    T* _data = nullptr;

    size_t _size = 0; 
    size_t _capacity = 0;
};
```

**main.cpp**
```c++
template <typename T>
void printVector(const Vector<T>& vec) {
    for (size_t i = 0; i < vec.size(); i++) {
        std::cout << vec[i] << std::endl;
    }

    std::cout << "-----------\n";
}

int main() {
    Vector<std::string> vec;
    vec.pushback("C++");
    vec.pushback("Kotlin");
    vec.emplaceback("Mojo");
    vec.emplaceback("Python");

    printVector(vec);

    vec.popback();

    printVector(vec);

    vec.clear();

    printVector(vec);

    return 0;
}
```

```
output:
C++
Kotlin
Mojo
Python
-----------
C++
Kotlin
Mojo
-----------
-----------
```