---
title: Coroutine in C++
author: Joe Chu
date: 2024-04-07 19:13:57
tags: [cpp, coroutine]
categories:
- cpp
---

Introduced in C++20

<!-- more -->

## Table of Contents
1. Coroutine Basics
2. State machine of a coroutine
3. First coroutine program
4. Resume a suspending coroutine
5. Lazy and eager coroutines
6. Restrictions on couroutines
7. co_yield
8. Access coroutine data
9. co_return
10. co_await

# 1. Coroutine Basics

Coroutine is a special function that suspends its execution and then resumes later. In C++, coroutines are stackless. They suspend by returning to the caller and the data that is required for later execution is stored on heap. Compared to regular functions, coroutines are suspendable by calling `co_yield` or `co_await`. Once the coroutine decides to suspend itself, it gives control back to the caller. This allows the caller to resume executing other instructions and at some point resume the coroutine. Finally, when a coroutine reaches the end of its execution, it will return to the caller by calling `co_return`.

<p align="center">
    <img src="function_coroutine.png" title="A regular image" width="800px" height="350px">
</p>

Coroutines in C++ do not inherently run on separate threads. They are executed in the same thread as the caller, but they provide a way to suspend and resume execution at certain points, allowing other work to be done in between.

| keyword   | actions | state   |
|-----------|---------|---------|
| co_yield  | output  | suspend |
| co_await  | input   | suspend |
| co_return | output  | end     |

# 2. State machine of a coroutine

A simple diagram shows the state transition of a coroutine.

<p align="center">
    <img src="statemachinecoroutine.png" title="A regular image" width="800px" height="350px">
</p>

# 3. First coroutine program

```c++
#include <iostream>
#include <coroutine>

struct ReturnType { // A wrapper type. This is the return type of the coroutine function's prototype
    struct promise_type { // the compiler looks for a type with the exact name promise_type inside the return type
        std::suspend_never initial_suspend() {return {}; } // gets executed before a coroutine starts execution
        std::suspend_never final_suspend() noexcept {return {}; } // gets executed when a coroutine finishes execution
        ReturnType get_return_object() {return {}; } // this is the first method gets called when the coroutine is called for the first time
        void unhandled_exception() {}
        
    };
};

ReturnType foo() {
    std::cout << "1 foo\n";
    co_await std::suspend_always(); // suspend
    std::cout << "2 foo\n"; // will never execute since coroutine suspends in the above line
}

int main()
{
    ReturnType r = foo();
    return 0;
}
```

```
1 foo
```

# 4. Resume a suspending coroutine

Coroutine provides class template `coroutine_handle` to refer to a coroutine. According to official documentation, it has 3 main specilizations.
- Primary template, can be created from the promise object of type Promise.
- Specialization std::coroutine_handle\<void\> erases the promise type. It is convertible from other specializations.
- Specialization std::coroutine_handle\<std::noop_coroutine_promise\> refers to no-op coroutines. It cannot be created from a promise object

```c++
#include <iostream>
#include <coroutine>

struct ReturnType {
    struct promise_type {
        std::suspend_never initial_suspend() {return {}; }
        std::suspend_never final_suspend() noexcept {return {}; }
        ReturnType get_return_object() {
            return ReturnType(std::coroutine_handle<promise_type>::from_promise(*this)); 
        }
        void unhandled_exception() {}
        
    };
    
    ReturnType(std::coroutine_handle<void> handle) : mHandle{handle} {}
    std::coroutine_handle<void> mHandle;
};

ReturnType foo() {
    std::cout << "1 foo\n";
    co_await std::suspend_always();
    std::cout << "2 foo\n";
}

int main()
{
    ReturnType r = foo();
    r.mHandle.resume(); // equivalent to r.mHandle();
    return 0;
}
```

```
1 foo
2 foo
```

# 5. Lazy and eager coroutines

Lazy coroutine
- Suspends immediately upon intial call.
- First line of the coroutine body executes only when resumes.

```c++
struct ReturnType {
    struct promise_type {
        std::suspend_always initial_suspend() {return {}; }
        ...
    };
    ...
};
```

Eager coroutine
- Starts immediately upon intial call.
- First line of the coroutine body always get executed. 

```c++
struct ReturnType {
    struct promise_type {
        std::suspend_never initial_suspend() {return {}; }
        ...
    };
    ...
};
```

# 6. Restrictions on couroutines

According to [cppreference](https://en.cppreference.com/w/cpp/language/coroutines#:~:text=Coroutines%20cannot%20use,cannot%20be%20coroutines.), courotines do not apply to some cases, such as  variadic arguments, plain return statements, or placeholder return types (auto or Concept),
consteval functions, constexpr functions, constructors, destructors, and the main function.

Some common scenarios where we can use coroutines.
```c++
struct ReturnType {
    struct promise_type {
        std::suspend_never initial_suspend() {return {}; }
        std::suspend_never final_suspend() noexcept {return {}; }
        ReturnType get_return_object() {
            return ReturnType(std::coroutine_handle<promise_type>::from_promise(*this)); 
        }
        void unhandled_exception() {}
        
    };
    
    ReturnType(std::coroutine_handle<void> handle) : mHandle{handle} {}
    std::coroutine_handle<void> mHandle;
};

struct Foo {
    // 1. member functions
    ReturnType func() {
        co_await std::suspend_always();
    }
    // 2. static member functions
    static ReturnType staticFunc() {
        std::cout << "1 staticFunc\n";
        co_await std::suspend_always();
        std::cout << "2 staticFunc\n";
    }
};

struct Base {
    // 3. pure virtual functions
    virtual ReturnType pure() const = 0;
};

struct Derived : public Base {
    // 4. overriding coroutine
    ReturnType pure() const override {
        std::cout << "1 pure\n";
        co_await std::suspend_always();
        std::cout << "2 pure\n";
    }
};

// 5. lambda expression
auto lambdaFunc = [](auto ... params) -> ReturnType {
    std::cout << "1 pure\n";
    co_await std::suspend_always();
    std::cout << "2 pure\n";
};
```

# 7. co_yield

To use `co_yield`, `promise_type` needs to define a method `yield_value`. After `yield_value` is called, the coroutine suspends and it gives the control back to the caller. 

```c++
struct ReturnType {
    struct promise_type {
        std::suspend_always yield_value(int val) {
            this->mVal = val;
            return std::suspend_always();
        }
        ...
    };
    ...
};
```

To implement a simple generator with `co_yield`.
```c++
#include <iostream>
#include <coroutine>

struct ReturnType {
    struct promise_type {
        int mVal;
        std::suspend_never initial_suspend() {return {}; }
        std::suspend_always final_suspend() noexcept {return {}; }
        
        ReturnType get_return_object() {
            return ReturnType(std::coroutine_handle<promise_type>::from_promise(*this)); 
        }
        void unhandled_exception() {}
        std::suspend_always yield_value(int val) {
            this->mVal = val;
            return std::suspend_always();
        }
        
    };
    
    ReturnType(std::coroutine_handle<promise_type> handle) : mHandle{handle} {}
    std::coroutine_handle<promise_type> mHandle;
    int getValue() const {
        return mHandle.promise().mVal;
    }
};

ReturnType generator(int start, int end, int step = 1) {
    for (int val = start; val < end; val+=step) {
        co_yield val;
    }
}

int main()
{
    auto gen = generator(0, 10, 2);
    while(!gen.mHandle.done()) {
        std::cout << "val: " << gen.getValue() << "\n";
        gen.mHandle();
    }
    return 0;
}
```
```
val: 0
val: 2
val: 4
val: 6
val: 8
```

# 8. Access coroutine data

Make sure `final_suspend()` has return type of `std::suspend_always`, otherwise, the coroutine will not reach its last suspend point.

```c++
#include <iostream>
#include <coroutine>

struct ReturnType {
    struct promise_type {
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; } // make sure final_suspend() is et 
        
        ReturnType get_return_object() {
            return ReturnType(std::coroutine_handle<promise_type>::from_promise(*this)); 
        }
        void unhandled_exception() { }

        double getValue() const {
            return this->val;
        }
        void setValue(double v) {
            this->val = v;
        }

        ~promise_type() {
            std::cout << "~promise_type\n";
            this->val = 1.23;
        }
        
        private:
            double val = 1.23;
    }; // promise_type
    
    ReturnType(std::coroutine_handle<promise_type> handle) : mHandle{handle} {}
    // implicit conversion to std::coroutine_handle<promise_type>
    operator std::coroutine_handle<promise_type>() {return mHandle;}
    private:
        std::coroutine_handle<promise_type> mHandle;
}; // ReturnType

ReturnType AccessDataCoroutine() {
    std::cout << "1 AccessDataCoroutine\n";
    co_await std::suspend_always();
    std::cout << "2 AccessDataCoroutine\n";
    co_await std::suspend_always();
    std::cout << "3 AccessDataCoroutine\n";
    co_await std::suspend_always();
}

double caller() {
    std::coroutine_handle<ReturnType::promise_type> h = AccessDataCoroutine(); // ReturnType contains the coroutine handle
    ReturnType::promise_type promise = h.promise(); // reference to the promise object.
    int i = 1;
    while (!h.done()) {
        promise.setValue(static_cast<double>(i++));
        h.resume();
    }
    return promise.getValue();
}

int main()
{
    double v = caller();
    std::cout << "Access data from coroutine: " << v << "\n";
}
```

```
1 AccessDataCoroutine
2 AccessDataCoroutine
3 AccessDataCoroutine
~promise_type
Access data from coroutine: 3
```

# 9. co_return
`co_return` must be defined inside `promise_type` struct, otherwise, the compiler will shows error message.

When the coroutine reaches `co_return`, it will return to its caller and its state will become end. `co_return` can either return nothing or value(s).

- return_void(): In this case, a good practice is to performan some cleanup operations inisde the `promise_type`, such as free up the allocated memory or reset the values.
- return_value(T val): Depending on the return type, we should decide the data type here. This `return_value` method will get executed by the runtime system when coroutines return with `non-empty` co_return.

It is important to know that these two return methods must be implemented inside the `promise_type` and these two can not exist at the same time.

return_void example:
```c++
#include <iostream>
#include <coroutine>

struct ReturnType {
    struct promise_type {
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; } // make sure final_suspend() is et 

        void return_void() {
            this->val = 1.23;
            std::cout << "perform cleanup operation here\n";
        }
        
        ReturnType get_return_object() {
            return ReturnType(std::coroutine_handle<promise_type>::from_promise(*this)); 
        }
        void unhandled_exception() { }

        double getValue() const {
            return val;
        }
        void setValue(double v) {
            this->val = v;
        }

        ~promise_type() {
            std::cout << "~promise_type\n";
        }

        private:
            int val = 1.23;
    }; // promise_type
    
    ReturnType(std::coroutine_handle<promise_type> handle) : mHandle{handle} {}
    // implicit conversion
    operator std::coroutine_handle<promise_type>() {return mHandle;}
    private:
        std::coroutine_handle<promise_type> mHandle;
}; // ReturnType

ReturnType foo() {
    std::cout << "1 foo\n";
    co_await std::suspend_always();
    std::cout << "reach co_return\n";
    co_return;
}

void caller() {
    std::coroutine_handle<ReturnType::promise_type> h = foo(); // ReturnType contains the coroutine handle
    while (!h.done()) {
        h.resume();
    }
}

int main()
{
    caller();
}
```
```
1 foo
reach co_return
perform cleanup operation here
```

return_value(T val) example:
```c++
#include <iostream>
#include <coroutine>

struct ReturnType {
    struct promise_type {
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; } // make sure final_suspend() is always

        void return_value(double v) {
            this->val = v;
            std::cout << "assign v to this->val\n";
        }
        
        ReturnType get_return_object() {
            return ReturnType(std::coroutine_handle<promise_type>::from_promise(*this)); 
        }
        void unhandled_exception() { }

        double getValue() const {
            return val;
        }
        void setValue(double v) {
            this->val = v;
        }

        ~promise_type() {
            std::cout << "~promise_type\n";
        }
        
        private:
            double val = 1.23;
    }; // promise_type
    
    ReturnType(std::coroutine_handle<promise_type> handle) : mHandle{handle} {}
    operator std::coroutine_handle<promise_type>() {return mHandle;}
    private:
        std::coroutine_handle<promise_type> mHandle;
}; // ReturnType

ReturnType foo(double value) {
    std::cout << "1 foo\n";
    co_await std::suspend_always();
    std::cout << "reach co_return value\n";
    co_return value;
}

void caller() {
    std::coroutine_handle<ReturnType::promise_type> h = foo(5.0); // ReturnType contains the coroutine handle
    while (!h.done()) {
        h.resume();
    }
    std::cout << "value from coroutine: " << h.promise().getValue() << "\n";
}

int main()
{
    caller();
}
```
```
1 foo
reach co_return value
assign v to this->val
value from coroutine: 5
```

# 10. co_await

`co_await` suspends a coroutine and returns control back to the caller. 
```c++
co_await expr;
```
As we see in previous examples, the most common use cases are:
```c++
co_await std::suspend_always();
co_await std::suspend_never();
```

`suspend_always` and `suspend_never` are both C++ structs that define their own member functions for deciding the coroutine behaviors when `co_await` is called.

| member function | description                                                                                                                                                                                                                                             |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| await_ready     | return a bool <br><br>- if true, call await_suspend <br>- if false, return control to caller                                                                                                                                                            |
| await_suspend   | - if return void, return control back to caller<br>- if return bool<br>  1. true - return to caller<br>  2. false - resume coroutine<br>- if returns a coroutine handle for some other coroutine, that handle is resumed (by a call to handle.resume()) |
| await_resume    | does nothing                                                                                                                                                                                                                                            |                                                                                                                                                                                                                              |                                                                                                                                                                                                                             	|

We can implement our own suspend class.
```c++
class SuspendAlways {
public:
    constexpr bool await_ready() const noexcept { 
        return false; 
    }

    constexpr void await_suspend( std::coroutine_handle<> ) const noexcept {

    }

    constexpr void await_resume() const noexcept {

    }
};
```

We can try it in our program to see if works like `std::suspend_always()`;
```c++
#include <iostream>
#include <coroutine>

struct ReturnType { // A wrapper type. This is the return type of the coroutine function's prototype
    struct promise_type { // the compiler looks for a type with the exact name promise_type inside the return type
        std::suspend_never initial_suspend() {return {}; } // gets executed before a coroutine starts execution
        std::suspend_never final_suspend() noexcept {return {}; } // gets executed when a coroutine finishes execution
        ReturnType get_return_object() {return {}; } // this is the first method gets called when the coroutine is called for the first time
        void unhandled_exception() {}
        
    };
};

class SuspendAlways {
public:
    bool await_ready() const noexcept { 
        std::cout << "await_ready()\n";
        return false; 
    }

    void await_suspend( std::coroutine_handle<> ) const noexcept {
        std::cout << "await_suspend()\n";
    }

    void await_resume() const noexcept {
        std::cout << "await_resume()\n";
    }
};

ReturnType foo() {
    std::cout << "1 foo\n";
    co_await SuspendAlways(); // suspend
    std::cout << "2 foo\n"; // will never execute since coroutine suspends in the above line
}

int main()
{
    ReturnType r = foo();
    return 0;
}
```
```
1 foo
await_ready()
await_suspend()
```
Since after the coroutine is suspended, we never resume it, so `await_resume` will not be called. Similarly, we can define a customized version of `std::suspend_never`. The main difference is that `await_ready()` should return `true` this time, and the coroutine will resume its execution.

# References
- https://www.youtube.com/watch?v=Ld_s1GtLkr4&list=PL2EnPlznFzmhKDBfE0lqMAWyr74LZsFVY&index=2
- https://en.cppreference.com/w/cpp/coroutine/coroutine_handle
- https://en.cppreference.com/w/cpp/language/coroutines#:~:text=%5Bedit%5D%20Restrictions,main%20function%20cannot%20be%20coroutines.