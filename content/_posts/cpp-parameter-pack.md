---
title: Parameter Pack in C++
author: Joe Chu
date: 2024-04-28 14:05:20
tags: [variadic]
categories:
- cpp
---

Template parameter pack and function parameter pack

<!-- more -->

# 1. Introduction

A parameter pack can pack multiple parameters into a single parameter by placing an ellipsis to the left of the parameter name. The basic systax of parameter pack can look like this.
```c++
template<class... Types>
struct Tuple {};
```

Based on the context of parameter pack is used, we have two types of parameter pack, namely, template parameter pack and function parameter pack.

# 2. Template Parameter Pack

Based on the type declared in template parameter pack. There are 3 kinds of template parameter pack.
- Type parameter pack
- Non-type parameter pack
- Template template parameter pack

We will only talk about the first two types.

## 2.1 Type parameter pack

This kind of parameter pack captures a sequence of types passed as template arguments. It allows you to work with a variable number(zero or more) of types within a template. You can then expand this pack to generate type-specific code or to pass the types to other templates or functions.

```c++
template<class... Types>
struct Tuple {};
 
Tuple<> t0;           // Types contains no arguments
Tuple<int> t1;        // Types contains one argument: int
Tuple<int, float> t2; // Types contains two arguments: int and float
Tuple<0> t3;          // error: 0 is not a type
```

## 2.2 Non-type parameter pack

This type of parameter pack captures a sequence of non-type template arguments. Non-type parameters can be integral types, pointers, references, or enums. They are used when you need to work with values known at `compile time`.

```c++
template<int... Values>
struct Tuple {};
 
Tuple<> t0;           // Values contains no arguments
Tuple<1> t1;        // Values contains one argument: int
Tuple<1, 2> t2; // Values contains two arguments: int and int
Tuple<1, 2.0> t3; // error: 2.0 is a double value
```

## 2.3 Position in parameter list

In a primary class template, the template parameter pack must be at the end of the parameter list.

```c++
template<typename... U, typename T>
struct InvalidTuple {};
```
```
<source>:9:10: error: parameter pack 'U' must be at the end of the template parameter list
    9 | template<typename... U, typename T>
      |          ^~~~~~~~
```

# 3. Function Parameter Pack

A function parameter pack is a function parameter that represents any number of function parameters. To use function parameter pack, we often use a template parameter pack as a function parameter. The template parameter pack then is expanded by the function parameter pack.

```c++
template<class... Types>
void f(Types... args);

f();       // OK: args contains no arguments
f(1);      // OK: args contains one argument: int
f(2, 1.0); // OK: args contains two arguments: int and double
```

## 3.1 trailing function parameter pack and non-trailing function parameter pack

If a function parameter pack is the last function parameter of a function template, then it is a `trailing function parameter pack`. Otherwise, it is a non-trailing function parameter pack.

**Rule for non-trailing function parameter pack instantiation**

A non-trailing function parameter pack can be deduced only from the explicitly specified arguments when the function template is called. If the function template is called without explicit arguments, the non-trailing function parameter pack must be empty.

```c++
template<class...A, class...B> void func(A...arg1,int sz1, int sz2, B...arg2)  
{
   std::cout << sz1 << " " << sz2 << '\n';
}

int main(void)
{
   //A:(int, int, int), B:(int, int, int, int, int) 
   func<int,int,int>(1,2,3,4,5,1,2,3,4,5);

   //A: empty, B:(int, int, int, int, int)
   func(0,5,1,2,3,4,5);
   return 0;
}
```

# 4. Parameter pack expansion

## 4.1 Function argument list
```c++
template<class... Us>
void f(Us... pargs) {
    ((std::cout << pargs << std::endl), ...); // Parameter pack expansion
    std::cout << "--------------\n";
}

template<class... Ws>
int h(Ws... args) {
    return (args + ...);
}
 
template<class... Ts>
void g1(Ts... args) {
    f(&args...); // “&args...” is a pack expansion
                 // “&args” is its pattern
                 // expand to f(&E1, &E2, &E3)
}

template<class... Ts>
void g2(Ts... args) {
    f(args...); // expand to f(E1, E2, E3)
}

template<class... Ts>
void g3(Ts... args) {
    f(5, ++args...); // expand to f(n, ++E1, ++E2, ++E3)
}

template<class... Ts>
void g4(Ts... args) {
    f(h(args...) + args...); /* expand to f(h(E1, E2, E3) + E1, 
                                            h(E1, E2, E3) + E2,
                                            h(E1, E2, E3) + E3,
                            */
}

int main() {
    g1(1, 0.2, "a"); // Ts... args expand to int E1, double E2, const char* E3
                    // &args... expands to &E1, &E2, &E3
                    // Us... pargs expand to int* E1, double* E2, const char** E3
    
    g2(1, 0.2, "a");
    g3(1, 0.2, 5);
    g4(1, 2, 3);
}
```
```
0x7ffd02d21a0c
0x7ffd02d21a10
0x7ffd02d21a18
--------------
1
0.2
a
--------------
5
2
1.2
6
--------------
7
8
9
--------------
```

## 4.2 Parenthesized initializers

Used as a class initializer.

```c++
template<typename... T>
struct Tuple {
    Tuple(T... args) : elements(args...) {}
    std::tuple<T...> elements;
};

int main() {
    Tuple t{1, 2, "a"};
}
```

## 4.3 sizeof...

`sizeof...` is an operator in C++ that returns the number of elements in a parameter pack.

```c++
template<typename... Args>
void printNumArgs(Args... args) {
    std::cout << "Number of arguments: " << sizeof...(args) << std::endl;
}

int main() {
    printNumArgs(1, 2, 3);                    // Outputs: Number of arguments: 3
    printNumArgs("hello", 42, 3.14, 'a');     // Outputs: Number of arguments: 4
    printNumArgs(); 
}
```

## 4.4 Braced-enclosed initializers

Used in braced-init-list.

```c++
template<typename... Ts>
void func(Ts... args)
{
    const int size = sizeof...(args) + 2;
    int res[size] = {1, args..., 2};

}

int main() {
    func(1, 2, 3);
}
```

## 4.5 Function parameter list

An ellipsis appears in a parameter declaration, even if the parameter name is being ignored, it is still a valid parameter pack and can be expanded.

```c++
template<typename... Ts>
void f(Ts...) {}

int main() {
    f('a', 1); // Ts... expands to void f(char, int)
    f(0.1);    // Ts... expands to void f(double)
}
```

```c++
template<typename T, class... Us>
void h(T value, Us... args) {
    std::cout << "value: " << value << "\n";
    std::cout << "args: \n";
    ((std::cout << args << std::endl), ...);
}

template<class... Ts>
void g5(Ts... args) { // g5 forward parameter pack "args" to h
    h(args...); // compiler deduces "T value" from the parameter pack
}

int main() {
    g5(1, 2, 3);
}
```

## 4.6 Template parameter list

```c++
template<typename... T>
struct ValueHolder {
    template<T... Values> // expand to non-type template parameter pack
    struct Apply {
        Apply() {
            ((std::cout << Values << std::endl), ...);
        }
    };
};

int main() {
    // Initializing an instance of Apply with values 1, 2, 3
    ValueHolder<int, int, int>::Apply<1, 2, 3> instance1;

    // Initializing an instance of Apply with values 'a', 'b', 'c'
    ValueHolder<char, char, char>::Apply<'a', 'b', 'c'> instance2;

    return 0;
}
```

## 4.7 Lambda captures

```c++
template<class... T>
void g(T... args) {
    ((std::cout << args << std::endl), ...);
}

template<class... Args>
void f(Args... args) {
    auto lm = [&, args...] {
        return g(args...);
    };
    lm();
}

int main() {
    f(1, 0.2, 'a');
}
```

## 4.8 More

More usages can be found at [cppreference.com](https://en.cppreference.com/w/cpp/language/parameter_pack#Alignment_specifier)

# 5. Variadic macro

## 5.1 \_\_VA_ARGS\_\_

- \_\_VA\_ARGS\_\_ is a predefined macro in C++.
- It represents a variable number of arguments passed to a variadic macro.
- It is used within a macro definition to refer to the arguments passed to the macro.
- It allows you to create macros that can accept a variable number of arguments.

```c++
#define SUM(...) sum(__VA_ARGS__)

template<class... Args>
int sum(Args... args) {
    return (args + ...);
}

int main() {
    std::cout << "Total: " << SUM(1, 2, 3) << "\n";
    return 0;
}
```

The following example is a misuse case of \_\_VA\_ARGS\_\_. The reason is that the stream insertion operator **<<** expects its right-hand side to be a single expression, not a list of potentially different types of expressions. As a result, this can lead to compilation errors or unexpected behavior.

```c++
#define DEBUG_PRINT(...) std::cout << "Debug: " << __VA_ARGS__ << std::endl;

int main() {
    DEBUG_PRINT("Hello, world!"); // ok
    DEBUG_PRINT("Hello, world!", 1); // error
}
```

## 5.2 \#\_\_VA_ARGS\_\_

\#\_\_VA\_ARGS\_\_ is a stringizing operator in C++.
When used within a macro definition, \#\_\_VA\_ARGS\_\_  converts the arguments passed to the macro into a string literal.
It is typically used to stringify the arguments for debugging or logging purposes.

```c++
#define DEBUG_PRINT(...) std::cout << "Debug: " << #__VA_ARGS__ << std::endl;

int main() {
    DEBUG_PRINT("Hello, world!");
    DEBUG_PRINT(42);
    DEBUG_PRINT(3.14, "pi");
}
```

# 6. Practice

```c++
#include <iostream>

// Primary template for tuple
template<typename... Ts>
struct Tuple {
    Tuple() {
        std::cout << "Base Case\n";
    }
};

// Specialization for non-empty tuple
template<typename T, typename... Ts>
struct Tuple<T, Ts...> {
    T value;
    Tuple<Ts...> rest;

    // Constructor to initialize value and rest
    Tuple(T t, Ts... ts) : value(t), rest(ts...) {}

    // Get element by index
    template<size_t index>
    auto& get() {
        if constexpr (index == 0) {
            return value;
        } else {
            return rest.template get<index - 1>();
        }
    }
};

// Helper function to make tuples
template<typename... Ts>
Tuple<Ts...> make_tuple(Ts... ts) {
    return Tuple<Ts...>(ts...);
}

// Example usage
int main() {
    auto t = make_tuple(1, 2.3, "hello");

    std::cout << "Tuple elements: " << t.get<0>() << ", " << t.get<1>() << ", " << t.get<2>() << std::endl;

    return 0;
}
```

- **Recursive construction builds the Tuple structure from the provided arguments**
    - 1. First call, `Tuple<int, double, const char*>`
    - 2. Inside the constructor of `Tuple<int, double, const char*>`, value is initialized with 1. The constructor of rest (of type `Tuple<double, const char*>`) is called recursively with the remaining arguments 2.3 and "hello".
    - 3. Second call, inside the constructor of `Tuple<double, const char*>`, value is initialized with 2.3. The constructor of rest (of type `Tuple<const char*>`) is called recursively with the remaining argument "hello".
    - 4. Third call, inside the constructor of `Tuple<const char*>`, value is initialized with "hello". Since there are no more arguments, the constructor of rest (of type `Tuple<>`) is called.
    - 5. Since `Tuple<>` is the primary template without any arguments, its constructor does nothing. It serves as the base case of the recursion.
- **Recursive get() function**
    - The expression `rest.template get<index - 1>()` is calling the get() function on the member `rest` of the Tuple.
    - `template` is used to specify that `get` is a template member function of the `rest` object. This disambiguates the use of the `get()` member   function.


# References
- https://www.ibm.com/docs/it/i/7.4?topic=c11-parameter-packs
- https://www.scs.stanford.edu/~dm/blog/param-pack.html#expanding-parameter-packs
- https://en.cppreference.com/w/cpp/language/parameter_pack#Alignment_specifier
- https://learn.microsoft.com/en-us/cpp/preprocessor/variadic-macros?view=msvc-170