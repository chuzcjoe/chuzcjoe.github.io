---
title: Class Size, Alignment and Padding
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/me.jpeg
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
    index: null
    collapsed: true
    depth: 3
  - position: left
    type: adsense
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2025-03-08 11:55:13
tags: [class]
categories:
- cpp
---

Stop defining/declaring member variables in random order.

<!-- more -->

# 1. Size

The size of a C++ class is primarily determined by its **non-static data members**, plus any additional memory aligment and padding requirements.

Each fundamental types (e.g., `char`, `float`, `int`) has a fixed size and alignment. Smaller types can cause padding if places inefficiently.

```cpp
struct A {
    char a;  // 1 byte
    int b;   // 4 bytes
};

// total = 1 + 3(padding) + 4 = 8
```

A pointer is just an address, it takes `8 bytes` on a 64-bit system, and `4 bytes` on a 32 bit system.

```cpp
struct A {
    int* p;   // 8 bytes (on a 64-bit system)
};

// total = 8
```

**Static members** do not affect class size because they are stored separately in global memory.

```cpp
struct A {
    int a; // 4 byes
    static int b; // 4 bytes, but do not affect class size
};

// total = 4
```

When a class contains another class object as a member, it inherits the memory layout of the conatined object.

```cpp
struct A {
    char a; // 1 byte
    int b; // 4 bytes
};
// total = 1 + 3(padding) + 4 = 8

struct B {
    A e;  // Size of A is 8 bytes
    double c; // 4 bytes
};
// total = 8 + 4 + 4(padding) = 16
```

If a class has at least one virtual function, it will contain a **hidden virtual table pointer**. The `vptr` takes `8 bytes` on a 64-bit system.

```cpp
struct C {
    virtual void foo() {}
};
// total = 8, due to a hidden vptr
```

**Empty base class optimization** means an empty base class usually takes `1 byte` to ensure unique address, however, compilers can optimize it by reducing its actual size to `0 byte`.

```cpp
struct Empty {};

struct A : Empty {
    int x;
};
// total = 4, due to empty base class optimization
```

`STL containers` take spaces dependent on their implementations. For example, `std::vector<T>` typically uses **3** pointers to manage its dynamic array.

```cpp
// std::vector<T structure
template <typename T>
struct VectorLayout {
    T* start;          // Points to the beginning of the allocated array
    T* finish;         // Points to one past the last element
    T* end_of_storage; // Points to the end of allocated memory
};
```

```cpp
struct A {
    char a; // 1 byte
    int b; // 4 bytes
    std::vector<int> vec; // 24 bytes
};

// total = 1 + 3 + 4 + 24 = 32
```

**Lambda functions** in C++ are implemented as unnamed (closure) classes. When a lambda is declared inside a class, it is treated as a hidden member class that can potentially increase the class size depending on how the lambda captures variables. Its use cases are a bit complicated, we will use another post to discuss it in the future.

# 2. Alignment and Padding

Alignment is a fundamental concept in C++ that ensures efficient memory access and prevents performance penalties due to unaligned memory access.

Each data type in C++ has an alignment requirement, which dictates that its memory address must be a multiple of a certain number (power of 2). The compiler inserts **padding bytes** to satisfy these requirements.

The **key rules**:
- The alignment requirement of a struct/class is determined by its largest member.
- The total size of a struct/class must be a multiple of its largest alignment.

```cpp
struct A {
    char a;   // 1 byte
    double d; // 8 bytes (must be aligned to 8, d needs to start at a multiple of 8)
    int b;    // 4 bytes (must be aligned to 4)
};
// total = 1 + 7(padding) + 8 + 4 + 4(padding) = 24
```

If we simply switch the order, we can optimize the memory layout.
```cpp
struct A {
    double d; // 8 bytes (must be aligned to 8, d needs to start at a multiple of 8)
    int b;    // 4 bytes (must be aligned to 4)
    char a;   // 1 byte
};
// total = 8 + 4 + 1 + 3(padding) = 16
```

In class inheritance, the alignment rule is also inherited from base class.

```cpp
struct Base {
    char a;   // 1 byte
    int b;    // 4 bytes
};

struct Derived : Base {
    double d; // 8 bytes
};

// total = 1 + 3(padding) + 4 + 8 = 16
```

We can check the alignment with `alignas`.

```cpp
struct A {
    char a;
    int b;
    double d;
};

int main() {
    std::cout << "Alignment of A: " << alignof(A) << " bytes\n"; // alignment of 8
}
```

`alignas` is powerful, and it allows us to control the alignment. `alignas(16)` forces the struct/class to align to `16 bytes`.

```cpp
struct alignas(16) A {
    char a;  // 1 byte
    int b;   // 4 bytes
};
// total = 1 + 3(padding) + 4 + 8 = 16
```

We can also use `alignas` to have fine-grain control over each individual member.

```cpp
struct A {
    char a;
    alignas(8) int b;
};
// total = 1 + 7(padding) + 4 + 4(padding) = 16
```
We added another `4` padding at the end because the total size must be the multiple of its largest member, in our case, it would be `alignas(8) int b;`.

`alignas` can be useful for **SIMD** optimization.

We can also use the `#pragma pack(1)` directive controls structure packing, telling the compiler to minimize padding between members by aligning them to `1-byte` boundaries instead of their natural alignment. It is compiler-specific, and its behavior can vary across different compilers.

```cpp
#pragma pack(1)  // Disable padding (1-byte alignment)
struct B {
    char a;  // 1 byte
    int b;   // 4 bytes
};
#pragma pack()  // Reset to default alignment

// total = 1 + 4 = 5
```

```cpp
#pragma pack(2)  // Align members to 2-byte boundaries
struct A {
    char a;  // 1 byte
    int b;   // 4 bytes
};

#pragma pack()  // Reset to default alignment

// total = 1 + 1(padding) + 4 = 6
```

# 3. Conclusion

1. Alignment and padding play a crucial role in C++ by optimizing memory access performance.
2. Efficient memory layout can be achieved by strategically reordering member declarations.
3. While we have manual control over alignment and padding, it should be used carefully to prevent unnecessary memory overhead or performance degradation.
4. In large projects, this aspect is often overlooked. However, when a class or struct is instantiated hundreds or thousands of times, careful design becomes essential.
