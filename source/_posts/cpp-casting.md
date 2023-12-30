---
title: Casting in C++
author: Joe Chu
date: 2023-12-06 12:59:46
tags: [cpp]
categories:
- cpp
---

C-style casting, static casting, dynamic casting, reinterept casting

<!-- more -->

# C-style casting

```c++
int main() {
    int x = 7;
    std::cout << (float)x / 2 << std::endl;
}
```

```
3.5
```

When comparing between signed and unsigned types, unexpected behavior could happen.

```c++
int main() {
    int x = -1;
    unsigned int y = 1;
    
    if (x >= y)
        std::cout << "x >= y\n";
    else
        std::cout << "x < y\n";
}
```

```
x >= y
```

The reason is that when comparing `x` and `y`, they will first be converted to two's complement representation.
for `int x = -1;`, its two's complement representation is: `1111 1111 1111 1111 1111 1111 1111 1111`.
for `unsigned int y = 1;`, its two's complement representation is: `0000 0000 0000 0000 0000 0000 0000 0001`.

The alternative solution is to use `std::cmp_greater` for better safe comparison.

```c++
int main() {
    int x = -1;
    unsigned int y = 1;
    
    if (std::cmp_greater(x, y))
        std::cout << "x >= y\n";
    else
        std::cout << "x < y\n";
}
```

```
x < y
```

# Static casting

It is a compile-time cast. In general, <span style="background-color: lightgray;">static_cast</span> is used to convert between numeric data types (i.e. int to float).
<span style="background-color: lightgray;">static_cast</span> is not as safe as <span style="background-color: lightgray;">dynamic_cast</span> as it does no run-time type check.


```c++
class Base {
private:
    int x;
public:
    Base() {x = 1;}
    
    virtual void print() {
        std::cout << "Base print, x = " << x << std::endl;
    }
};

class Derived : public Base {
private:
    int x;
public:
    Derived() {x = 2;}
    
    void print() override {
        std::cout << "Derived print, x = " << x << std::endl;
    }
};
    
int main() {
    Base b;
    Derived d;
    
    b.print();
    d.print();
    
    (static_cast<Base>(d)).print();
    
    // (static_cast<Derived>(b)).print(); Error!
}
```

```
Base print, x = 1
Derived print, x = 2
Base print, x = 1
```

It is okay to cast an object to its base class type, but not the other way.

Continue the above example.

```c++
class Base {
private:
    int x;
public:
    Base() {x = 1;}
    
    virtual void print() {
        std::cout << "Base print, x = " << x << std::endl;
    }
};

class Derived : public Base { // If changed to private/protected, casting will not work
private:
    int x;
public:
    Derived() {x = 2;}
    
    void print() override {
        std::cout << "Derived print, x = " << x << std::endl;
    }
};
    
int main() {
    Base* b = new Base();
    Derived* d = new Derived();
    
    static_cast<Derived*>(b)->print(); // Not safe, d could have fields and methods that are not in b
    static_cast<Base*>(d)->print(); // Safe, d always contains all of b
}
```

```
Base print, x = 1
Derived print, x = 2
```

To use `static_cast` in case of inheritance, the base class must be accessible to the derived classes. In the example above, if `Derived` is inherited as `private/protected`, it will not compile.

`static_cast` is able to cast to and from `void pointer`

```c++
int main() {
    int* i = new int;
    *i = 10;
    void* v = static_cast<void*>(i);
    int* ip = static_cast<int*>(v);
    std::cout << *ip;
    delete i;
}
```

```
10
```

# Dynamic casting

Definition from cpprefernce: **Safely converts pointers and references to classes up, down, and sideways along the inheritance hierarchy.**.

upcasting and downcasting can be illustrated in the figure below.

<p align="center">
    <img src="casting.png" title="A regular image" width="300px" height="500px">
</p>

dynamic_cast does run-time type check so it will introduce runtime overhead. To work with dynamic_cast, **there must be one virtual function in the base class**. For example:

```c++
class Base {
private:
    int x;
public:
    Base() {x = 1;}
    
    void print() {
        std::cout << "Base print, x = " << x << std::endl;
    }
};

class Derived : public Base {
private:
    int x;
public:
    Derived() {x = 2;}
    
    void print() {
        std::cout << "Derived print, x = " << x << std::endl;
    }
};
    
int main() {
    Base* b = new Base();
    Derived* d = new Derived();
    
    Base* bc = dynamic_cast<Base*>(d); // Ok, upcasting
    Derived* dc = dynamic_cast<Derived*>(b); // Error, downcasting
}
```

```
main.cpp:32:19: error: 'Base' is not polymorphic
    Derived* dc = dynamic_cast<Derived*>(b);
                  ^                      ~
1 error generated.
```

# Reinterpret cast

It is used to convert a pointer of some data type into a pointer of another data type. It does not check if the pointer type and data pointed is same or not.

You will see some unexpected results. For example:

```c++
int main() {
    float pi = 3.14f;
    std::cout << *reinterpret_cast<int*>(&pi) << std::endl;  
}
```

```
1078523331
```

Let's see a more comprehensive example.

```c++
struct GameStats {
    int level;
    int health;
    int points;
    bool GameCompleted;
    bool BossDefeated;
};

int main() {
    GameStats gs = {6, 99, 55, false, false};
    
    char buffer[sizeof(gs)];
    memcpy(buffer, &gs, sizeof(gs));
    
    // C-style casting
    std::cout << *((int*)(buffer)) << std::endl;
    std::cout << *((int*)(buffer+4)) << std::endl;
    
    std::cout << *reinterpret_cast<int*>(buffer+0) << std::endl;
    std::cout << *reinterpret_cast<int*>(buffer+4) << std::endl;
    std::cout << *reinterpret_cast<int*>(buffer+8) << std::endl;
    std::cout << *reinterpret_cast<bool*>(buffer+12) << std::endl;
    std::cout << *reinterpret_cast<bool*>(buffer+13) << std::endl;
}
```

```
6
99
6
99
55
0
0
 
```

The memory allocation of buffer can be depicted as follows.

<p align="center">
    <img src="buffer.png" title="A regular image" width="300px" height="500px">
</p>

Although C-style casting can work, using `reinterpret_cast` is more readable.

Reinterpret_cast can also convert a pointer to a class to another class.

```c++
class A {
public:
    void fooA() {
        std::cout << "in A\n";    
    }
};

class B {
private:
    int m_x;
public:
    B(int x) : m_x(x) {}
    
    void fooB() {
        std::cout << "in B, m_x = " << m_x << std::endl;    
    }
};


int main() {
    A* a = new A();
    B* b = reinterpret_cast<B*>(a);
    b->fooB();
    delete a;
}
```

```
in B, m_x = 0
```

# References
- https://en.cppreference.com/w/cpp/utility/intcmp
- https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines
- https://learn.microsoft.com/en-us/cpp/cpp/static-cast-operator?view=msvc-170
- https://en.cppreference.com/w/cpp/language/dynamic_cast
- https://www.geeksforgeeks.org/reinterpret_cast-in-c-type-casting-operators/