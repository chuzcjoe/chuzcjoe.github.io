---
title: Static in C++
author: Joe Chu
date: 2023-11-21 16:45:15
tags: [cpp]
categories:
- cpp
---

Static variables/functions, static in the context of class/struct

<!-- more -->

# Internal linkage and external linkage

When you write an implementation file (.cpp, .cxx, etc) your compiler generates a translation unit. This is the source file from your implementation plus all the headers you #included in it.

`Internal linkage` refers to everything only in scope of a translation unit.

`External linkage` refers to things that exist beyond a particular translation unit. In other words, accessible through the whole program, which is the combination of all translation units (or object files).

Internal linkage can be achieved by using `static` keyword. Let's see an example where we have two .cpp files.

**main.cpp**
```c++
#include <iostream>

extern int a;

int main() {
    std::cout << a << std::endl;
}
```

**static.cpp**
```c++
int a = 5;
```

compile and run:
```
g++ main.cpp static.cpp -o main
./main

5
```

`int a = 5;` is extern by default. Other translation unit (main.cpp) has access to it. If we change static.cpp to:

**static.cpp**
```c++
static int a = 5;
```

The compiler will give us errors as following. This is because `a` is now only visible in the scope of its translation unit. Other translation units are not accessible.
```
main.cpp:(.text+0xa): undefined reference to `a'
```

`const` variables are also static by default and only accessible in the scope of a translation unit. However, we can explicitly declare them as `extern` to be able to extend to other files.

**main.cpp**
```c++
#include <iostream>

int a = 8;
extern int ci;

int main() {
    std::cout << a << std::endl;
    std::cout << ci << std::endl;
}
```

**static.cpp**
```c++
static int a = 5;
extern const int ci = 10;
```

compile and run:
```
8
10
```

We are using `ci` declared in static.cpp.

# Static in a function

When a variable is declared as static, memory will be allocated for the lifetime of the program. Even if the function gets called multiple times, the space for the static variable will only be allocated once and the its value will get carried through the next call.

```c++
void foo() {
    static int a = 0;
    std::cout << a << std::endl;
    a++;
}

int main() {
    for (int i = 0; i < 10; i++) {
        foo();
    }
}
```

output:
```
0
1
2
3
4
5
6
7
8
9
```

# Static in class

When we declare a member of class as static, only one copy of the static member is maintained no matter how many objects of the class we create. Thus, a static member is shared by all the objects. It can be initialized outside of the class using scope resolution operator `::`. Static members can not be initialized using constructors.  

```c++
class Base {
public:
    static int m_count;
    
    Base() {
        m_count++;
    }
};

// Initialize static member of Base
int Base::m_count = 0;

int main() {
    Base b1;
    Base b2;
    
    std::cout << "number of objects: " << Base::m_count << std::endl;
}
```

```
number of objects: 2
```

Just like static variables, static member functions also do not depend on the object of the class. We can use the class name followed by `::` to invoke the static member functions. `Note that` static member functions can only access the static member variable and functions. They can not access non-static data of the class.

```c++
class Base {
public:
    static int m_count;
    int m_a;
    
    Base(int a) : m_a(a) {
        m_count++;
    }
    
    static void foo() {
        std::cout << m_a << std::endl;
    }
};

// Initialize static member of Base
int Base::m_count = 0;

int main() {
    Base b1(1);
    Base b2(2);
    
    b1.foo();
}
```

```
Line 12: Char 22: error: invalid use of member 'm_a' in static member function
        std::cout << m_a << std::endl;
                     ^~~
```

We change `m_a` to `m_count` in foo()
```c++
class Base {
public:
    static int m_count;
    int m_a;
    
    Base(int a) : m_a(a) {
        m_count++;
    }
    
    static void foo() {
        std::cout << m_count << std::endl;
    }
};

// Initialize static member of Base
int Base::m_count = 0;

int main() {
    Base b1(1);
    Base b2(2);
    
    b1.foo();
    b2.foo();
}
```

```
2
2
```

# References
- https://stackoverflow.com/questions/1358400/what-is-external-linkage-and-internal-linkage
- https://www.geeksforgeeks.org/static-keyword-cpp/
- https://www.tutorialspoint.com/cplusplus/cpp_static_members.htm

