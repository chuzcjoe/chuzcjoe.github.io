---
title: Union in C++
author: Joe Chu
date: 2024-06-04 09:52:55
tags: [union]
categories:
- cpp
---

A union is a special class type that can hold only one of its non-static data members at a time.

<!-- more -->

# 1. Introduction

A union declaration is similar to struct/class declaration. Just like in struct declaration, the default member access in a union is `public`.

- A union can have member functions (including constructors and destructors), but not virtual functions.
- A union cannot have base classes and cannot be used as a base class.
- A union cannot have non-static data members of reference types.

In a union, only one member can be activated at a time. We can only access the currently activated member. Accessing other inactivated members will have undefined behavior.
```cpp
consteval auto union_size() {
    union U1 {
        std::int32_t x; // 4 bytes
        std::int8_t y; // 1 bytes
        float z[2]; // 8 bytes
    }; // The whole U1 occupies 8 bytes

    U1 u1;
    u1.x = {0x12345678};

    return sizeof(u1);
}

consteval auto union_activation() {
    union U2 {
        float i; // 4 bytes
        double j; // 8 bytes
    };

    U2 u2;
    u2.i = {1.};

    return u2.j;
}

int main() {
    [[maybe_unused]] constexpr auto a = union_size();
    std::cout << "size of union: " << a << '\n'; // 8

    /*
    Error:
    accessing 'union_activation()::U2::j' member instead of initialized 
    'union_activation()::U2::i' member in constant expression
    */
    [[maybe_unused]] constexpr auto b = union_activation();
}
```

# 2. Switch activated members

## 2.1 Trivial types

For trivial types, we can simply assign a new value to the member we want to activate.
```cpp
#include <iostream>
#include <cstring>

union U {
    int x;
    float y;
    char z[15];

    U() : x(1) {}
    U(float v) : y(v) {}
    U(const char* c) {
        std::strncpy(z, c, sizeof(z) - 1);
        z[sizeof(z) - 1] = '\0';
    }

    // operator overload
    U& operator=(float v) {
        y = v;
        return *this;
    }

    U& operator=(const char* c) {
        std::strncpy(z, c, sizeof(z) - 1);
        z[sizeof(z) - 1] = '\0';
        return *this;
    }
};

int main() {
    U u;
    std::cout << u.x << '\n';
    u = 2.;
    std::cout << u.y << '\n';
    u = "hello, world";
    std::cout << u.z << '\n';
}
```

## 2.2 Non-trivial types

For non-trivial types, we need to carefully manage the construction and destruction of the union members. This involves using `placement new` to construct a new member and explicitly calling the destructor of the previously active member.
```cpp
#include <iostream>
#include <new>
#include <string>
#include <vector>

class A {
public:
    A(int val) {
        x = new int{val};
        std::cout << "A(int x) called, x = " << *x << '\n';
    }
    ~A() {
        delete x;
        x = nullptr;
        std::cout << "~A() called\n";
    }
    void print() const {
        std::cout << "print x = " << *x << '\n';
    }

private:
    int* x;
};

union U {
    std::vector<int> vec;
    std::string str;
    A a;

    // Constructor
    U() {
        std::cout << "U()\n";
    }
    // Destructor
    ~U() {
        std::cout << "~U()\n";
    }
};

int main() {
    U u;

    // Initialize std::vector<int>
    new (&u.vec) std::vector<int>({1, 2, 3});
    std::cout << "Vector content: ";
    for (int i : u.vec) {
        std::cout << i << " ";
    }
    std::cout << std::endl;
    u.vec.~vector<int>(); // Explicitly call the destructor

    // Switch to std::string
    new (&u.str) std::string{"Hello, Union"};
    std::cout << "String content: " << u.str << std::endl;
    u.str.~basic_string(); // Explicitly call the destructor

    // Switch to CustomClass
    new (&u.a) A(3);
    u.a.print();
    u.a.~A(); // Explicitly call the destructor

    return 0;
}
```

```
U()
Vector content: 1 2 3 
String content: Hello, Union
A(int x) called, x = 3
print x = 3
~A() called
~U()
```

# 3. Anonymous unions

An anonymous union is a union without a name. Anonymous unions allow you to define a union directly within a class or a struct, and their members are accessed as if they are members of the enclosing class or struct. This feature can simplify the code by avoiding the need to explicitly refer to the union name when accessing its members.

```cpp
struct A {
    enum class Tag { CHAR, INT, DOUBLE } tag;

    // Anonymous union
    union {
        char c;
        int i;
        double d;
    };
};

void print(const A& a) {
    switch(a.tag) {
        case A::Tag::CHAR:
            std::cout << a.c << '\n';
            break;
        case A::Tag::INT:
            std::cout << a.i << '\n';
            break;
        case A::Tag::DOUBLE:
            std::cout << a.d << '\n';
            break;
        default:
            break;
    }
}

int main() {
    A a{A::Tag::CHAR, 'A'};
    print(a);

    a.tag = A::Tag::INT;
    a.i = 1;
    print(a);

    a.tag = A::Tag::DOUBLE;
    a.d = 3.;
    print(a);
}
```

Some limitations of anonymous unions.

1. Cannot have member functions.
2. All members must be public, no access specifiers.
3. Cannot have static members.
4. The types contained within the anonymous union must be trivially constructible, trivially destructible.
5. Ambiguity with local vaiables sharing the same name.

# References

- https://en.cppreference.com/w/cpp/language/union