---
title: Design An Allocator
author: Joe Chu
date: 2024-06-08 18:50:16
tags: [allocator]
categories:
- cpp
---

Control how memory is allocated and deallocated.

<!-- more -->

# 1. Introduction

Custom allocators in C++ allow developers to control how memory is allocated and deallocated, providing opportunities for optimization and resource management tailored to specific needs. The Standard Template Library (STL) uses allocators to manage memory, and by default, it uses std::allocator, but we can provide our own allocator for customized behavior.

# 2. Example

```c++
#include <iostream>
#include <cstring>

template<typename T>
class Allocator {
public:
    Allocator() noexcept {
        std::cout << "Allocator()\n";
    }

    ~Allocator() noexcept {
        std::cout << "~Allocator()\n";
    }

    T* allocate(std::size_t n) {
        std::cout << "allocating " << n << " element(s) of size " << sizeof(T) << '\n';
        return static_cast<T*>(::operator new(n * sizeof(T)));
    }

    void deallocate(T* p, std::size_t n) noexcept {
        std::cout << "deallocating " << n << " elements of size " << sizeof(T) << ".\n";
        ::operator delete(p);
    }

    // Construct an element of type U at the given memory location
    template <typename U, typename... Args>
    void construct(U* p, Args&&... args) {
        std::cout << "Constructing element.\n";
        new (p) U(std::forward<Args>(args)...);
    }

    // Destroy an element of type U at the given memory location
    template <typename U>
    void destroy(U* p) {
        std::cout << "Destroying element: " << *p << '\n';
        p->~U();
    }
};

template <typename T, typename Alloc = std::allocator<T>>
class Array {
public:
    using allocator_type = Alloc;
    using value_type = T;
    using size_type = std::size_t;
    using pointer = T*;
    using const_pointer = const T*;
    using reference = value_type&;
    using const_reference = const value_type&;

    Array(size_type size) : _size(size), _data(_alloc.allocate(_size)), _pos(0){
        for (size_type i = 0; i < _size; ++i) {
            _alloc.construct(_data + i);
        }
    }

    ~Array() {
        for (size_type i = 0; i < _size; ++i) {
            _alloc.destroy(_data + i);
        }
        _alloc.deallocate(_data, _size);
    }

    void add(T&& val) {
        new (&_data[_pos++]) T(std::move(val));
    }

    reference operator[](size_type index) {
        return _data[index];
    }

    const_reference operator[](size_type index) const {
        return _data[index];
    }

    size_type size() const noexcept {
        return _size;
    }

private:
    size_type _size;
    pointer _data;
    allocator_type _alloc;
    int _pos;
};

int main() {
    /*
    Example 1: String allocation
    */
    std::cout << "Example 1\n";
    Allocator<std::string> allocator;
    std::string* p = allocator.allocate(3);
    allocator.construct(p, "A");
    allocator.construct(p + 1, "B");
    allocator.construct(p + 2, "C");
    for (std::size_t i = 0; i < 3; ++i) {
        std::cout << p[i] << '\n';
    }
    for (std::size_t i = 0; i < 3; ++i) {
        allocator.destroy(p + i);
    }
    allocator.deallocate(p, 3);

    /*
    Example 2: Array allocation
    */
    std::cout << "Example 2\n";
    Array<int, Allocator<int>> arr(3);
    arr.add(1);
    arr.add(2);
    arr.add(3);
    for (int i = 0; i < arr.size(); ++i) {
        std::cout << arr[i] << '\n';
    }
}
```
```
Example 1
Allocator()
allocating 3 element(s) of size 32
Constructing element.
Constructing element.
Constructing element.
A
B
C
Destroying element: A
Destroying element: B
Destroying element: C
deallocating 3 elements of size 32.
Example 2
allocating 3 element(s) of size 4
Allocator()
Constructing element.
Constructing element.
Constructing element.
1
2
3
Destroying element: 1
Destroying element: 2
Destroying element: 3
deallocating 3 elements of size 4.
~Allocator()
~Allocator()
```