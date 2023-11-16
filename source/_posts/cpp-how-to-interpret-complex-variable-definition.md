---
title: How to interpret complex C++ variable declarations
author: Joe Chu
date: 2023-11-12 14:23:09
tags: [cpp]
categories:
- cpp
---

From int* p to int (*(*p)[])()

C++ variable definition can be very complex when *\**, *&* and nested brackets exist. This tutorial lists some examples from easy to advanced level to help you walk you through each of them and understand how we should interpret them in a more systematic way.

<!-- more -->

## Example 1
Definition like below is quite easy and straightfoward. It declares a pointer *p* that points to an Integer.
*p* itself exists on stack but the Integer that it points to is on heap memory.
```c++
int* p = new int;
``` 

## Example 2
```c++
int* v[5];
```

This example represents an array of 5 pointers. These 5 pointers are pointing to Integers.
<p align="center">
    <img src="example2.png" title="A regular image" width="300px" height="200px">
</p>

Here's a breakdown:
- int*: Indicates that the elements of the array are pointers to integers.
- v[5]: Indicates that v is an array with 5 elements.


## Example 3
```c++
int (*v)[5];
```

This example represents a pointer *v* to an array of 5 Integers.

<p align="center">
    <img src="example3.png" title="A regular image" width="300px" height="200px">
</p>

Here's a breakdown:
- (*v): Indicates that v is a pointer.
- [5]: Indicates that the elements pointed to by v form an array of size 5.
- int: Indicates that the elements of the array are of type int.

## Example 5
```c++
int p(); // p is a function that returns a int value
int (*p)(); // p is a pointer to a function. The function takes no arguments and returns a int value.
```

Here's a breakdown:
- (*p)(): Indicates that p is a pointer to a function.
- int: Specifies that the function returns an integer.
- (): Indicates that the function takes no arguments.

## Example 6
```c++
int (*v[])();
```

It represents an array of pointers. Each pointer points to functions that return int values.

<p align="center">
    <img src="example6.png" title="A regular image" width="300px" height="200px">
</p>

Here's a breakdown:
- v[]: Indicates that v is an array.
- (*v[])(): Indicates that the elements of the array are pointers to functions.
- int: Specifies that the functions return integers.
- (): Indicates that the functions take no arguments.

A simple demo code
```c++
// Define two functions that match the pointer type
int function1() {
    return 1;
}

int function2() {
    return 2;
}

int main() {
    // Declare an array of pointers to functions
    int (*v[])() = { &function1, &function2 };

    // Call the functions through the array of pointers and print the results
    for (int i = 0; i < 2; ++i) {
        std::cout << "Result at index " << i << ": " << v[i]() << std::endl;
    }

    return 0;
}
```

## Example 7

```c++
int (*(*v)[])();
```

It declares a pointer v to an array of pointers. Each pointer points to functions returning integers.

<p align="center">
    <img src="example7.png" title="A regular image" width="300px" height="200px">
</p>

Here's a breakdown:
- (*v)[]: This part declares a pointer to an array. The *v declares a pointer, and [] indicates that this pointer is pointing to an array.
- int (*)(): This part declares a pointer to a function. The int is the return type of the function, (*) indicates it's a pointer to a function, and () indicates that the function takes no parameters.

A simple demo code:
```c++
int func1() {
    std::cout << "Function 1\n";
    return 1;
}

int func2() {
    std::cout << "Function 2\n";
    return 2;
}

int main() {
    int (*funcs[2])() = {func1, func2};

    int (*(*v)[2])() = &funcs;

    // Call the first function in the array
    int result = ((*v)[0])();
    std::cout << "Result: " << result << std::endl;

    // Call the second function in the array
    result = ((*v)[1])();
    std::cout << "Result: " << result << std::endl;

    return 0;
}

```

## Example 8

```c++
int* p(); // function p returns a pointer to an Integer

int (*p)(); // p is a pointer to a function. The function takes no arguments and returns an Integer
```

## Example 9

```c++
int const a;
const int a;
```

They are equivalent and *a* can not be modified.

## Example 10

```c++
int const *p; // p is a pointer to a const int
int *const p; // p is a const pointer to an int
```

```c++
int main() {
    const int a = 5;
    int b = 6;
    int c = 8;
    
    int const *p1 = &a;
    int *const p2 = &b;
    
    std::cout << "p1: " << *p1 << std::endl;
    std::cout << "p2: " << *p2 << std::endl;
    
    *p1 = 1; // error
    p2 = &c; // error

    return 0;
}
```

## Conclusion

**right-to-left rule**
Start reading the declaration from the innermost parentheses, go right, and then go left. When you encounter parentheses, the direction should be reversed. Once everything in the parentheses has been parsed, jump out of it. Continue till the whole declaration has been parsed.

for example:
```c++
float ( * ( *p()) [] )();
```
1. Start from the variable name -------------------------- p
2. Go right, find () ---------- p is a function
3. Nothing to the right, go left and find * ------------ returns a pointer
4. Go right, find [] -------------- to an array
5. Go left, find * --------------- pointers
6. Go right, find () ---------- to functions
7. Go left, find float ---------- return float

**So, the result is:** p is a function that returns a pointer. The pointer points to an array of pointers. Each pointer points to functions that return float value.


## References
- https://www.codeproject.com/Articles/7042/How-to-interpret-complex-C-C-declarations
