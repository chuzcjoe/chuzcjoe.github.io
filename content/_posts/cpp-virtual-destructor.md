---
title: Virtual destructor
author: Joe Chu
date: 2023-11-17 16:00:07
tags: [cpp]
categories:
- cpp
---

Virtual destructor is used to prevent memory leak in the context of polymorphism.

<!-- more -->

Let's start with a simple example.

```c++
class Base {
public:
    Base() {
        std::cout << "Base constructor called\n";
    }
    
    ~Base() {
        std::cout << "Base deconstructor called\n";
    }
};

class Derived : public Base {
public:
    Derived() {
        std::cout << "Derived constructor called\n";
    }
    
    ~Derived() {
        std::cout << "Derived deconstructor called\n";
    }
};

int main() {
    Base* b = new Base();
    delete b;
    
    std::cout << "----------\n";
    
    Derived* d = new Derived();
    delete d;
}
```

output:
```
Base constructor called
Base deconstructor called
----------
Base constructor called
Derived constructor called
Derived deconstructor called
Base deconstructor called
```

When we define a `Base` type pointer and the pointer points to `Derived`, things are different. The `~Derived()` is not called.

```c++
class Base {
public:
    Base() {
        std::cout << "Base constructor called\n";
    }
    
    ~Base() {
        std::cout << "Base deconstructor called\n";
    }
};

class Derived : public Base {
public:
    Derived() {
        std::cout << "Derived constructor called\n";
    }
    
    ~Derived() {
        std::cout << "Derived deconstructor called\n";
    }
};

int main() {
    Base* b = new Derived();
    delete b;
}
```

output:
```
Base constructor called
Derived constructor called
Base deconstructor called
```

This is when we might have memory leak in C++. Suppose we have data created in `Derived`, the destructor is responsible for cleaning up the memeory, however, it never gets called.

```c++
class Base {
public:
    Base() {
        std::cout << "Base constructor called\n";
    }
    
    ~Base() {
        std::cout << "Base deconstructor called\n";
    }
};

class Derived : public Base {
private:
    int* m_data;
public:
    Derived() {
        m_data = new int[5];
        std::cout << "Derived constructor called\n";
    }
    
    ~Derived() {
        std::cout << "Derived deconstructor called\n";
        delete[] m_data;
    }
};

int main() {
    Base* b = new Derived();
    delete b;
}
```

All we need to do is to make Base destructor virtual. That will fix this problem.

```c++
class Base {
public:
    Base() {
        std::cout << "Base constructor called\n";
    }
    
    virtual ~Base() {
        std::cout << "Base deconstructor called\n";
    }
};

class Derived : public Base {
private:
    int* m_data;
public:
    Derived() {
        m_data = new int[5];
        std::cout << "Derived constructor called\n";
    }
    
    ~Derived() {
        std::cout << "Derived deconstructor called\n";
        delete[] m_data;
    }
};

int main() {
    Base* b = new Derived();
    delete b;
}
```

output:
```
Base constructor called
Derived constructor called
Derived deconstructor called
Base deconstructor called
```

# References
- https://www.geeksforgeeks.org/virtual-destructor/