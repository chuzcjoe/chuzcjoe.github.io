---
title: Construct Thread Objects With Member Functions
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
    index: true
    collapsed: true
    depth: 3
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2025-01-27 21:03:51
tags: [thread]
categories:
- cpp
---

Start a new thread with static/non-static member functions.

<!-- more -->

# 1. Introduction

According to [cpprefenrence](https://en.cppreference.com/w/cpp/thread/thread/thread), to start a new thread with `std::thread`, its constructor takes the following parameters:

**Callable Object (mandatory)**:
The first argument must be a callable object, such as:

A function pointer (e.g., void myFunction()).
A lambda function (e.g., `[]() { /* code */ }`).
A pointer to a member function (e.g., &MyClass::myMethod).
A functor (an object with an overloaded operator()).

**Arguments for the Callable (optional)**:
After the callable, you can pass additional arguments to the thread's constructor. These arguments will be passed to the callable when the thread is started.

```cpp example.cpp
// 1. Function Pointer
std::thread t(functionName, arg1, arg2, ...);

// 2. Lambda Function
std::thread t([](int x) { std::cout << x; }, 10);  // Callable + arguments

// 3. Member Function
std::thread t(&ClassName::memberFunction, &object, arg1, arg2, ...);

// 4. Functor
std::thread t(FunctorObject(), arg1, arg2, ...);
```

# 2. Non-static Member Functions

```cpp
#include <iostream>
#include <thread>
#include <string>

class TaskRunner {
public:
    // Non-static member function that takes a TaskRunner pointer
    void taskFunction(TaskRunner* runner) {
        std::cout << "Running task with TaskRunner instance!" << std::endl;
        runner->printMessage();  // Access instance methods via the pointer
    }

    // Member function to start a new thread
    void startThread() {
        // Launch a thread with the non-static member function
        // Pass `this` (pointer to the current TaskRunner instance)
        std::thread t(&TaskRunner::taskFunction, this, this);
        t.detach();  // Detach the thread to let it run independently
    }

    // Example member function to be accessed by taskFunction
    void printMessage() {
        std::cout << "Hello from TaskRunner!" << std::endl;
    }
};

int main() {
    TaskRunner runner;

    // Start a new thread using the non-static member function
    runner.startThread();

    // Main thread continues execution
    std::cout << "Main thread continues..." << std::endl;

    // Give the detached thread some time to finish its work
    std::this_thread::sleep_for(std::chrono::seconds(1));

    return 0;
}
```

**Why is this passed twice?**
- First `this`: It binds the non-static member function (taskFunction) to the specific instance of TaskRunner. This is necessary because taskFunction is non-static and requires an instance to operate on. Without `this`, the thread would not know which instance of the class to invoke the function on.

- Second `this`: It passes the current instance (this) to the function as the argument, allowing the thread to work on that instance.

# 3. Static Member Functions

Passing `this` twice is not necessary and we can use a static member function to avoid it. This is because static member functions are not tied to any specific object instance; they behave like regular global or free functions.

```cpp
#include <iostream>
#include <thread>
#include <string>

class TaskRunner {
public:
    // Static member function that takes a TaskRunner object as a parameter
    static void taskFunction(TaskRunner* runner) {
        // Accessing member data or methods from the TaskRunner instance
        std::cout << "Task is running on TaskRunner object!" << std::endl;
        runner->printMessage();  // Example of using the object's member function
    }

    // Member function to start a new thread using the static taskFunction
    void startThread() {
        // Launch a thread with the static member function, passing `this` as the parameter
        std::thread t(&TaskRunner::taskFunction, this);  // Passing `this` to the static function
        t.detach();  // Detach the thread to run independently
    }

    // Example member function to be used in the static function
    void printMessage() {
        std::cout << "Hello from TaskRunner!" << std::endl;
    }
};

int main() {
    TaskRunner runner;

    // Start a new thread using the static member function
    runner.startThread();

    // Main thread continues execution
    std::cout << "Main thread continues..." << std::endl;

    // Give the detached thread some time to finish its work
    std::this_thread::sleep_for(std::chrono::seconds(1));

    return 0;
}
```

Static member functions can only access static data or data passed explicitly to it. Here, we pass a pointer(`this`) to a `TaskRunner` object (TaskRunner* runner) as its parameter. This allows the static function to access the instance-specific data or call other member functions of the `TaskRunner` object. Now, we only need to pass `this` once in the `std::thread` constructor, as it serves as the argument for the static member function.

# References
- https://en.cppreference.com/w/cpp/thread/thread/thread