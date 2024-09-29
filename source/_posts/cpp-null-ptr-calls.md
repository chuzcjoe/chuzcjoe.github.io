---
title: C++ Null Pointer Function Calls
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
  - position: left
    type: categories
date: 2024-09-14 23:06:32
tags: [nullptr]
categories:
- cpp
---

Null pointers don't mean nothing at all.

<!-- more -->

```cpp
class A {
public:
    void func1() {
        std::cout << "func1()\n";
    }

    virtual void func2() {
        std::cout << "func2 in A\n";
    }
};

class B : public A {
public:
    virtual void func2() override {
        std::cout << "func2 in B\n";
    }
};

int main() {
    B* ptr = nullptr;
    ptr->func1();
    // ptr->func2(); crash
    return 0;
}

/*
output:
func1()
*/
```
`func1` can be called and executed even when the pointer is `null` because:
- **Non-virtual function call**: func1() is a non-virtual function. In C++, non-virtual function calls are resolved at `compile-time` based on the static type of the pointer or reference.
- **Static binding**: Because func1() is non-virtual, the compiler uses static binding to determine which function to call. It looks at the declared type of the pointer (B*) and finds the func1() method in the base class A.
- **No object access**: The implementation of func1() doesn't access any member variables or call any other member functions that would require a valid object. It only prints a string to the standard output.
- **Function call mechanism**: When calling a non-virtual function through a pointer, the compiler essentially translates ptr->func1() to something like A::func1(ptr). The this pointer is passed as a hidden argument, but it's not actually used in the function.
- **Undefined behavior**: It's important to note that while this code may appear to work, it's actually undefined behavior. The C++ standard doesn't guarantee that this will work on all systems or with all compilers. It just happens to work in many common implementations.

As previously mentioned, `func1()` doesn't interact with any other variables or functions, so it's safe to call it using a null pointer. However, if we modify it to rely on other variables or functions, the behavior would change drastically.

```cpp
class A {
public:
    int x;
    
    void func1() {
        std::cout << "func1()\n";
        std::cout << "x = " << x << std::endl;  // Accessing member variable
        helperFunc();  // Calling another member function
    }

    void helperFunc() {
        std::cout << "Helper function called\n";
    }

    virtual void func2() {
        std::cout << "func2 in A\n";
    }
};

class B : public A {
    virtual void func2() override {
        std::cout << "func2 in B\n";
    }
};


int main() {
    B* ptr = nullptr;
    ptr->func1(); // error
    return 0;
}
```

- **Undefined Behavior**: Attempting to access x or call helperFunc() through a null pointer is undefined behavior. The program is likely to crash or produce unexpected results.
- **Segmentation Fault**: On most systems, this will result in a segmentation fault or access violation when trying to read the value of x or when trying to call helperFunc().
- **No "this" pointer**: Since ptr is null, there's no valid "this" pointer. Attempts to access member variables or call other member functions effectively try to dereference a null pointer.