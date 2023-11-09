---
title: C++20 new feature - std::span
author: Joe Chu
date: 2023-11-09 09:58:41
tags: [cpp]
categories:
- cpp
---

std::span was introduced as a new feature in C++20

<!-- more -->

std::span provides an efficient way to view a contiguous sequence of objects.

span class is defined as below
```c++
template<
    class T,
    std::size_t Extent = std::dynamic_extent
> class span;
```

## syntax
```c++
std::span<type> span_name;
```

## usage
```c++
//1. from an array
std::span<float> name(array);

//2. from a vector
std::span<float> name(vector);

//1. from a string
std::span<char> name(string);
```

## more member functions
- data(): A pointer to the first element of the sequence.
- size(): Returns the size of the sequence that is the number of elements in the sequence.
- empty(): Returns a boolean value that indicates whether the sequence is empty.
- front(): A reference to the first element of the sequence.
- back(): A reference to the last element of the sequence.
- operator[]: An accessor that returns a reference to the element at the specified index.
- at(): An accessor that returns a reference to the element at the specified index, throwing an exception if the index is out of bounds.
- begin(): A function that returns an iterator to the beginning of the sequence.
- end(): A function that returns an iterator to the end of the sequence.

## example
```c++
#include <iostream> 
#include <span> 
using namespace std; 
  
int main() 
{ 
    std::vector<int> vec = { 1, 2, 3, 4, 5 }; 
  
    span<int> span_vec(vec); 
  
    for (const auto& num : span_vec) { 
        cout << num << " "; 
    } 
    return 0; 
}

// output
// 1 2 3 4 5 
```

## motivations for using std::span
- **Non-owning View:** std::span does not own the data it points to. It simply provides a view over an existing sequence, allowing you to work with the data without creating a copy. This can improve performance and memory efficiency, especially when dealing with large amounts of data.

- **Safety:** When you use std::span, you can perform bounds checking and ensure that you do not inadvertently access elements beyond the bounds of the underlying data.

- **Slicing:** You can create sub-spans from an existing std::span, allowing you to work with specific portions of the data. This can be useful when you want to process only a part of a larger data set.

## references
- https://www.geeksforgeeks.org/cpp-20-std-span/
- https://en.cppreference.com/w/cpp/container/span