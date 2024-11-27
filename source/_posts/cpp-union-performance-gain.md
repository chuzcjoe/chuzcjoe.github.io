---
title: Performance Gains with Union
author: Joe Chu
toc: true
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
date: 2024-11-23 00:08:48
tags: [union, performance]
categories:
- cpp
---

The power of Unions for efficient memory usage and performance improvement.

<!-- more -->

# 1. Union Basics

In C++, a union is a special data structure that allows multiple members to share the same memory location. All members of a union start at the same memory address, meaning that at any given time, only one member of the union can hold a value. This contrasts with a struct, where each member has its own memory location.

- The memory allocated for a union is equal to the size of its largest member, and all members share that same memory space.
- Only one member can hold a valid value at any time, though the union can store different types of values across its members.

# 2. Use Case

Here we have a typical senario where we can use `union` to enhance the cod efficiency. Our goal is to assign values to non-trivial types like `int`, `float`, and `bool`. In the less efficient implementation, we dynamically allocate memory for each data type. However, in the optimized version, we use a union to hold all the required variable types. This approach allows different types of variables to share the same memory address, eliminating redundant memory allocations.

```cpp
#include <iostream>
#include <chrono>
#include <vector>
#include <memory>
#include <cstring>

const int numOperations = 1000000;

// Without union - traditional struct approach
struct RegularData {
    // Pointer to hold the actual data
    void* value;

    // Constructor for int
    RegularData(int val) {
        value = new int(val);
    }

    // Constructor for float
    RegularData(float val) {
        value = new float(val);
    }

    // Constructor for bool
    RegularData(bool val) {
        value = new bool(val);
    }

    // Constructor for string
    RegularData(const char* val) {
        // Allocate memory and copy the string
        size_t len = std::strlen(val) + 1; // Include null terminator
        value = new char[len];
        std::strcpy(static_cast<char*>(value), val);
    }
};                       

// With union - optimized approach
struct OptimizedData {
    enum class Type {INT, FLOAT, BOOL, STRING} type; 
    union DataUnion {        // Size of largest member: 16 bytes
        int a;
        float b;
        bool c;
        char d[16];
    } data;

    OptimizedData(int val) {
        data.a = val;
    }

    OptimizedData(float val) {
        data.b = val;
    }

    OptimizedData(bool val) {
        data.c = val;
    }

    OptimizedData(const char* val) {
        std::strncpy(data.d, val, sizeof(data.d) - 1);
        data.d[sizeof(data.d) - 1] = '\0';
    }
};

void performanceTestRegular() {
    std::vector<RegularData> data;
    
    auto start = std::chrono::high_resolution_clock::now();
    
    // Perform operations using the union
    for (int i = 0; i < numOperations; ++i) {
        switch (i % 4) {
            case 0: // Use int data
                data.emplace_back(1);
                break;
            case 1: // Use float data
                data.emplace_back(1.f);
                break;
            case 2: // use bool data
                data.emplace_back(true);
                break;
            case 3: // Use string data
                data.emplace_back("hello");
                break;
            default:
                break;
         }
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "Performance Test (Regular):\n";
    std::cout << "Time taken for " << numOperations << " operations: " 
              << duration.count() << " milliseconds\n";
}

void performanceTestOptimized() {
    std::vector<OptimizedData> data;
    
    auto start = std::chrono::high_resolution_clock::now();
    
    // Perform operations using the union
    for (int i = 0; i < numOperations; i++) {
        switch (i % 4) {
            case 0: // Use int data
                data.emplace_back(1);
                break; 
            case 1: // Use float data
                data.emplace_back(1.f);
                break;
            case 2: // use bool data
                data.emplace_back(true);
                break;
            case 3: // Use string data
                data.emplace_back("hello");
                break;  
            default:
                break;
         }
    }
    
    auto end = std::chrono::high_resolution_clock::now();
    auto duration = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    
    std::cout << "Performance Test (Optimized):\n";
    std::cout << "Time taken for " << numOperations << " operations: " 
              << duration.count() << " milliseconds\n";
}

int main() {
    performanceTestOptimized();
    performanceTestRegular();
    return 0;
}
```

```
Performance Test (Optimized):
Time taken for 1000000 operations: 74 milliseconds
Performance Test (Regular):
Time taken for 1000000 operations: 96 milliseconds
```

~**23%** performance improvement by using `union`.

# 3. Conclusion

The optimized version using a `union` is faster because:

1. Regular version uses `new`, requiring dynamic allocation on heap memory. The optimized version uses a union which pre-allocates fixed space on the stack. Heap allocations are much slower than stack operations.

2. Dynamically allocated memory is scattered across the heap, making memory access less predictable and potentially resulting in cache misses. The optimized version stores data within the object, making it contiguous in memory and improving cache locality.

3. In regular version, every access requires dereferencing the pointer, introducing additional overhead. Copying or moving a `RegularData` object involves duplicating or reassigning pointers, potentially leading to more heap operations. The union stores the data inline, so no pointer dereferencing is required. Copying or moving `OptimizedData` objects is more efficient because it only involves copying the fixed-size union.


