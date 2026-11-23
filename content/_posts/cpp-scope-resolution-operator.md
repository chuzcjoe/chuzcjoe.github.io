---
title: Scope Resolution Operator Use Cases
author: Joe Chu
date: 2024-06-03 14:19:18
tags: [scope resolution operator]
categories:
- cpp
---

Summary of some common use cases of scope resolution operator.

<!-- more -->

**1. Access namespace mmebers(variables, functions, classes)**
```cpp
namespace A {
    int a = 10;
    void printA() {
        std::cout << a << '\n';
    }
}

int main() {
    std::cout << A::x << '\n'; // Outputs 10
    myNamespace::printA(); // Outputs 10
    return 0;
}
```

**2. Access global variables, function, ...**
```cpp
int x = 10; // Global x

int main() {
    int x = 20;
    std::cout << ::x << '\n'; // Print 10
}

```

**3. Enum class members**
```cpp
enum class Color { RED, GREEN, BLUE };

Color myColor = Color::RED;
```

**4. Access static class members**
```cpp
class A {
public:
    static int x;
    static void printX() {
        std::cout << x << std::endl;
    }
};

int A::x = 10; // Initialize static member variable

int main() {
    std::cout << A::x << '\n';
    A::printX();
    return 0;
}
```

**5. Call class member functions with a pointer**
```cpp
class A {
public:
    void printVal(int x) {
        std::cout << x << std::endl;
    }
};

int main() {
    A* p = new A;
    p->A::printVal(10);
    return 0;
}
```

**6. Access base class members**
```cpp
class A {
public:
    int x;
    void foo() {
        std::cout << "A foo(), x = " << x << '\n';
    }
};

class B : public A {
public:
    void setValue(int value) {
        A::x = value + 1; // Explicit access to x from the Base class
        A::foo();
    }
    void foo() {
        std::cout << "B foo(), x = " << x << '\n';
    }
};
```

**7. Defining and Using Type Aliases with Namespaces**
```cpp
namespace A {
    // Type alias for an integer vector
    using IntVector = std::vector<int>;

    // Another type alias for a pointer to a function returning int and taking two int parameters
    using FuncPtr = int(*)(int, int);
}

int main() {
    A::IntVector numbers = {1, 2, 3, 4, 5};

    // Using the type alias for a function pointer defined in MyNamespace
    auto lm = [](int a, int b){
        return a + b;
    };
    A::FuncPtr fptr = lm;
    int result = fptr(10, 20);

    return 0;
}
```

**8. Resolving ambiguity in multiple inheritance**
```cpp
class A {
public:
    int x = 5;
};

class B : public A { // inherits from class A
public:
    int i = 6;
};

class C : public A { // inherits from class A
public:
    int i = 7;
};

class D : public B, public C { // inherits from both classes B and C
};

int main() {
    D obj;
    std::cout << obj.B::x << std::endl; // Accessing x from B's A
    std::cout << obj.C::x << std::endl; // Accessing x from C's A
    return 0;
}
```