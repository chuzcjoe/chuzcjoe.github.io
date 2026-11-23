---
title: Virtual Function
author: Joe Chu
date: 2023-11-17 15:12:18
tags: [cpp]
categories:
- cpp
---

Virtual function, pure virtual function, abstract class

<!-- more -->

# Virtual function

A virtual function is a member function in the base class that we expect to `redefine` in derived classes.

`override` identifier is not necessary but highly recommended to use to avoid bugs. When using `override`, the compiler will display related error messages when bugs exists. For examples:
- Functions with incorrect names
- Functions with different return types
- Functions with different parameters

```c++
class Base {
public:
    Base() {}
    
    virtual void print() {
        std::cout << "Base print()\n";
    }
};

class Derived : public Base {
public:
    Derived() {}
    
    void print() override {
        std::cout << "Derived print()\n";
    }
};

int main() {
    Base* b = new Derived();
    b->print(); // Derived print()
    
    delete b;
}
```

**One thing to note** is that, the Derived class does not have to implement a virtual function defined in Base class. The following example also works.

```c++
class Base {
public:
    Base() {}
    
    virtual void print() {
        std::cout << "Base print()\n";
    }
};

class Derived : public Base {
public:
    Derived() {}
    
    // void print() override{
    //     std::cout << "Derived print()\n";
    // }
};

int main() {
    Base* b = new Derived();
    b->print(); // Base print()
    
    delete b;
}
```

You may hear of another terminology called `dynamic dispatch`. By declaring a method as virtual, the C++ compiler uses a vtable to define the name-to-implementation mapping for a given class as a set of member function pointers. However, one can use explicit scoping, rather than dynamic dispatch, to ensure a specific version of a function is called.

```c++
class Base {
public:
    Base() {
        std::cout << "Base constructor called\n";
    }
    
    virtual void foo() {
        std::cout << "Base foo()\n";
    }
    
    virtual ~Base() {
        std::cout << "Base deconstructor called\n";
    }
};

class Derived : public Base {
public:
    Derived() {
        std::cout << "Derived constructor called\n";
    }
    
    void foo() override {
        std::cout << "Derived foo()\n";    
    }
    
    ~Derived() {
        std::cout << "Derived deconstructor called\n";
    }
};

int main() {
    Base* b = new Derived();
    b->Base::foo();
    delete b;
}
```

```
Base constructor called
Derived constructor called
Base foo()
Derived deconstructor called
Base deconstructor called
```


# Pure virtual function

A pure virtual function is a function defined in base class but has no implementation. It requires its derived classes to implement their own versions of this function. A class containing pure virtual function(s) is called `abstract class`.

```c++
class Base {
public:
    Base() {}
    
    virtual void print() = 0; // pure virtual function
};
```

A `abstract class` can not be instantiate. If the derived class does not implement the pure virtual function, it makes the derived class an abstract class as well. We can neither instantiate the derived class.

```c++
class Base {
public:
    Base() {}
    
    virtual void print() = 0;
};

class Derived : public Base {
public:
    Derived() {}
};

int main() {
    Base b; // Error
    Derived d; // Error
}
```

Abstract class can have its own constructor.

```c++
class Base {
protected:
    int m_x;
public:
    Base(int x) : m_x(x) {}
    
    virtual void print() = 0;
};

class Derived : public Base {
private:
    int m_y;
public:
    Derived(int x, int y) : Base(x) {
        m_y = y;
    }
    
    void print() override {
        std::cout << "x: " << m_x << " " << "y: " << m_y << std::endl;
    }
};

int main() {
    Base* d1 = new Derived(1, 2);
    Base* d2 = new Derived(2, 1);
    
    d1->print(); // x: 1 y: 2
    d2->print(); // x: 2 y: 1
    
    delete d1;
    delete d2;
}
```

# References
- https://www.programiz.com/cpp-programming/virtual-functions
- https://www.geeksforgeeks.org/pure-virtual-functions-and-abstract-classes/
