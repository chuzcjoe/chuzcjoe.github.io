---
title: Smart pointer in C++
author: Joe Chu
date: 2023-11-06 21:04:58
tags: [c++]
categories:
- cpp
---

shared_ptr, unique_ptr, weak_ptr

<!-- more -->

## Problems with regular pointers in C++
- Memory Leak: memory is repearedly allocated on the heap but never gets de-allocated, which leads to excessive memory.
- Dangling pointer: The memory location where a pointer is pointing to is deleted. However, the pointer remains the same and is not set to be nullptr.

**shared_ptr**
```c++
void print_shared_ptr(const std::shared_ptr<int>& sptr) {
    std::cout << "value: " << *sptr << std::endl;
    std::cout << "addr: " << sptr.get() << std::endl;
    std::cout << "count: " << sptr.use_count() << std::endl;
    std::cout << "is unique? : " << sptr.unique() << std::endl;
    std::cout << "---------------------\n";
}

int main() {
    std::shared_ptr<int> sp = std::make_shared<int>(1);
    print_shared_ptr(sp);
    
    *sp = 2;
    print_shared_ptr(sp);
    
    // remove sp ownership
    sp.reset();
    sp = std::make_shared<int>(3);
    print_shared_ptr(sp);
    
    // a new pointer points to the same memory
    std::shared_ptr<int> another_ptr = sp;
    print_shared_ptr(sp);
}
```

code output:
```
value: 1
addr: 0x603000000020
count: 1
is unique? : 1
---------------------
value: 2
addr: 0x603000000020
count: 1
is unique? : 1
---------------------
value: 3
addr: 0x603000000050
count: 1
is unique? : 1
---------------------
value: 3
addr: 0x603000000050
count: 2
is unique? : 0
---------------------
```

**unique_ptr**
Only one pointer is granted the ownership of one memory space. If the ownership needs to be changed，use std::move semantic to transfer the ownership.
```c++
void print_unique_ptr(const std::unique_ptr<int>& sptr) {
    std::cout << "value: " << *sptr << std::endl;
    std::cout << "addr: " << sptr.get() << std::endl;
    std::cout << "---------------------\n";
}


int main() {
    std::unique_ptr<int> sp = std::make_unique<int>(1);
    print_unique_ptr(sp);

    *sp = 2;
    print_unique_ptr(sp);

    sp.reset();
    sp = std::make_unique<int>(3);
    print_unique_ptr(sp);

    // a new pointer points to the same memory
    std::unique_ptr<int> another_ptr = std::move(sp);
    std::cout << "-----\n";
    std::cout << sp.get() << std::endl;
    std::cout << "-----\n";
    
    print_unique_ptr(another_ptr);
}
```

code output
```
value: 1
addr: 0x602000000010
---------------------
value: 2
addr: 0x602000000010
---------------------
value: 3
addr: 0x602000000030
---------------------
-----
0
-----
value: 3
addr: 0x602000000030
---------------------
```

**weak_ptr**
weak_ptr is similar to shared_ptr, except that it does not hold Reference Counter.
```c++
class Rectangle {
    int width;
    int height;
 
public:
    Rectangle(int w, int h) : width(w), height(h) {}
 
    int area() { return width * height; }
};
 
int main() {
    shared_ptr<Rectangle> P1(new Rectangle(10, 5));
   
    // create weak ptr
    weak_ptr<Rectangle> P2 (P1);
   
    // This'll print 50
    cout << P1->area() << endl;
 
    // This'll print 1 as Reference Counter is 1
    cout << P1.use_count() << endl;
    return 0;
}
```

code output:
```
50
1
```

