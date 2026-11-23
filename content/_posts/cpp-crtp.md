---
title: CRTP
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
date: 2025-03-23 23:36:49
tags: [crtp]
categories:
- cpp
---

Curiously Recurring Template Pattern

<!-- more -->

# 1. What is CRTP?

A CRTP is where a Derived class:
1. Inherits from a template class.
2. Uses the derived class itself as a template parameter of the base class.

CRTT enables `static polymorphism`, reducing the overhead of dynamic dispatch(dynamic polymorphism) when using `virtual functions`.

```cpp
#include <iostream>


template <typename T>
class Base {
public:
    void interface() {
        static_cast<T*>(this)->implement();
    }
};

class Derived : public Base<Derived> {
public:
    void implement() {
        std::cout << "Derived: implement()\n";
    }
};

int main() {
    Derived d;
    d.interface();
}
```

# 2. Two Forms of CRTP

## 2.1 Static Interface

This usage of CRTP is really similar to the runtime polymorphism, where the Base class represents the interface(no actual implementation) and the Derived one represents the detailed implementation of that interface.

The difference is that there is no vtable and associated vptr in the code. All the polymorphic calls are resolved at compile time, avoiding the runtime virtual function look-up cost. Since all the information is known at compile time, It is the developers’ responsibility to carefully design the inheritance hierarchy and make sure the right polymorphic calls are correctly implemented, otherwise, we will get runtime errors of “undefined reference” to some functions.

```cpp
#include <iostream>

template <typename T>
struct Base {
  int getValue() {
    return static_cast<T *>(this)->getValue();
  }
};

struct Derived1 : Base<Derived1> {
  int getValue() const {
    return 1;
  }
};

struct Derived2 : Base<Derived2> {
  Derived2(int val) : x(val) {}
  int getValue() const {
    return x;
  }
private:
    int x = 0;
};

template <typename T>
void print(Base<T>& obj) {
    std::cout << obj.getValue() << '\n';
}

int main() {
    Derived1 d1;
    Derived2 d2{2};

    print<Derived1>(d1);
    print<Derived2>(d2);
}
```

## 2.2 Adding Functionalities

Adding functionalities(also called mixin pattern) allows the Base class to provide reusable functionalities that can operate on Derived classes. For example, let's say we have different logging behaviors for different Systems.

```cpp
class Application : public Base<Application> {
public:
  Application(double delay) : delay_{delay} {}
  std::string getName() const {return "App";}
  double getDelayTime() const {return delay_;}
  void log() {
    std::cout << getName() << ", delayed: " << getDelayTime() << '\n';
  }
private:
  double delay_ = 0.0;
};

class Server : public Base<Server> {
public:
  Server(double delay) : delay_{delay} {}
  std::string getName() const {return "Server";}
  double getDelayTime() const {return delay_;}
  void log() {
    std::cout << getName() << ", delayed: " << getDelayTime() << '\n';
  }
private:
  double delay_ = 0.0;
};
```

If other systems also require this logging capability, do we need to duplicate the same implementation in each new derived class? With `CRTP`, we can encapsulate the common functionality in the Base class and seamlessly apply it to all Derived classes, eliminating redundant code.

```cpp
#include <iostream>

template <typename T>
class Base {
public:
  void log() {
    T* ptr = static_cast<T*>(this);
    std::cout << ptr->getName() << ", delayed: " << ptr->getDelayTime() << '\n';
  }
};

class Application : public Base<Application> {
public:
  Application(double delay) : delay_{delay} {}
  std::string getName() const {return "App";}
  double getDelayTime() const {return delay_;}
private:
  double delay_ = 0.0;
};

class Server : public Base<Server> {
public:
  Server(double delay) : delay_{delay} {}
  std::string getName() const {return "Server";}
  double getDelayTime() const {return delay_;}
private:
  double delay_ = 0.0;
};

int main() {
    Application a{1000.0};
    Server s{100.0};

    a.log();
    s.log();
}
```

# 3. Can we remove static_cast?

As we probably can see, we have to mannually cast the Base `this` pointer to a Derived type in order to use Derived functions. Extensive use of `static_cast` makes the code looks heavy. Are we able to get rid of it?

The answer is YES. In C++ 23, we can use `explicit object parameter` to explicitly use the Derived object as a parameter, avoiding the need of `static_cast`.

```cpp
#include <iostream>

template <typename Derived>
struct Base {
    void interface(this Derived& self) {
        self.implementation();
    }
};

struct Derived : Base<Derived> {
    void implementation() {
        std::cout << "Derived implementation\n";
    }
};

int main() {
    Derived d;
    d.interface();
}
```

# 4. A Perfect Replacement for Virtual Functions?

Though `CRTP` avoids the runtime overhead, it is not always a perfect replacement for virtual functions. I think the two most significant limitations are:

1. One major downside of `CRTP` is that every derived class creates a new instantiation of the base class template, which can lead to code bloat and prevent shared base-class behavior across different derived types.

2. With virtual functions, you can store objects of different derived types in a `std::vector<Base*>`. With CRTP, this is not possible, as the base class is templated and does not define a common type.

# References
- https://www.fluentcpp.com/2017/05/16/what-the-crtp-brings-to-code/
- https://www.youtube.com/watch?v=pmdwAf6hCWg&t=1291s