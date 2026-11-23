---
title: Design Iterator
author: Joe Chu
date: 2023-12-15 13:55:26
tags: [ood]
categories:
- cpp
---

Design a customized iterator.

<!-- more -->

# Introduction

Today, we will explore how to design a customized iterator. Iterators in C++ are convenient to iterate over a collection of elements in C++ standard contains. The example below shows some common operations in iterators.

```c++
int main() {
    std::vector<int> vec = {1, 2, 3, 4, 5};
    
    std::vector<int>::iterator bit = vec.begin();
    std::vector<int>::iterator eit = vec.end();
    
    std::cout << *bit << std::endl;
    
    bit++;
    std::cout << *bit << std::endl;
    
    bit--;
    std::cout << *bit << std::endl;
    
    if (bit == eit) {
        std::cout << "same position\n";    
    } else {
        std::cout << "different position\n";    
    }
    
    for (auto it = vec.begin(); it != vec.end(); it++) {
        std::cout << *it << std::endl;    
    }
    
    return 0;
}
```

```
output:
1
2
1
different position
1
2
3
4
5
```

# Code

In order to write our own iterator, we will continue to use the `Vector` class we designed from previous [tutorial](/2023/12/14/cpp-design-vector). But we still need to change it a little bit to make our code nice and clean.

**Vector.h**
```c++
#pragma once
#include <new>

template <typename Vector>
class VectorIterator {
public:
    using ValueType = typename Vector::ValueType;
    using PointerType = ValueType*;
    using ReferenceType = ValueType&;
public:
    VectorIterator(PointerType ptr) : _ptr(ptr) {}

    // prefix ++
    VectorIterator& operator++() {
        _ptr++;
        return *this;
    }

    // postfix ++
    VectorIterator operator++(int) {
        VectorIterator iterator = *this;
        ++(*this);
        return iterator;
    }

    // prefix --
    VectorIterator& operator--() {
        _ptr--;
        return *this;
    }

    // postfix --
    VectorIterator operator--(int) {
        VectorIterator iterator = *this;
        --(*this);
        return iterator;
    }

    ReferenceType operator[](int index) {
        return *(_ptr + index);
    }

    PointerType operator->() {
        return _ptr;
    }

    ReferenceType operator*() {
        return *_ptr;
    }

    bool operator==(const VectorIterator& other) const {
        return _ptr == other._ptr;
    }

    bool operator!=(const VectorIterator& other) const {
        return !(*this == other);
    }

private:
    PointerType _ptr;

};

template<typename T>
class Vector {
public:
    using ValueType = T;
    using Iterator = VectorIterator<Vector<T>>;
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

    Iterator begin() {
        return Iterator(_data);
    }

    Iterator end() {
        return Iterator(_data + _size);
    }

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
#include "Array.h"
#include "Vector.h"
#include <cstring>
#include <iostream>
#include <memory>
#include <string>
#include <vector>

int main() {
    Vector<std::string> vec;
    vec.pushback("C++");
    vec.pushback("Kotlin");
    vec.emplaceback("Mojo");

    for (auto it = vec.begin(); it != vec.end(); it++) {
        std::cout << *it << std::endl;
    }
    
    return 0;
}
```

```
output:
C++
Kotlin
Mojo
```