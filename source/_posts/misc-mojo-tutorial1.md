---
title: 🔥 Mojo Tutorial 1
author: Joe Chu
date: 2023-11-14 11:44:01
tags: [mojo]
categories:
- misc
---

Install, setup, basics

<!-- more -->

Mojo is a programming language developed for the MLIR compiler framework that provides a unified programming framework for software development, especially in the field of artificial intelligence. (from Wiki)

Mojo is a new programming language that bridges the gap between research and production by combining Python syntax and ecosystem with systems programming and metaprogramming features. Mojo is still young, but it is designed to become a superset of Python over time. (from github)

## Introduction
This will be a series of tutorials and most of the examples are from official Mojo tutorials.
[https://docs.modular.com/mojo/](https://docs.modular.com/mojo/)

## Install
1. It is easy to install on your PC and supports Mac, Linux and Windows. Simply follow the instruction on the offical website to install it. [https://www.modular.com/mojo](https://www.modular.com/mojo)

2. I highly recommend to use VSCODE for development. Mojo extension is available on VSCODE.

## Hello World
```python
let hello = "hello world"

fn main():
    print("hello world")

# to run it
# in command line:
# mojo main.mojo

# output: hello world
```

You can also type *mojo* in your terminal to enter REPL session.
<p align="center">
    <img src="REPL.png" title="A regular image" width="500px" height="300px">
</p>

## Build an executable binary

- create executable
```
mojo build main.mojo
```

- run executable
```
./main

outout: hello world
```

## Basics
Mojo is a complied language and Mojo code can be ahead-of-time (AOT) or just-in-time (JIT) compiled.

`fn` keyword is the function definition in Mojo. `var` defines a mutable variable. `let` creates an immutable value.

```python
fn main():
    var x: Int = 1
    let y: Int = 2
    x += 1
    print(x)
    print(y)
```

`Int` is declared as the type for function arguments and return type.
```python
fn add(x: Int, y: Int) -> Int:
    return x + y

z = add(1, 2)
print(z) # 3
```

Functions also takes default values.
```python
fn pow(base: Int, exp: Int = 2) -> Int:
    return base ** exp

# Uses default value for `exp`
z = pow(3)
print(z) #9

# Uses keyword argument names (with order reversed)
z = pow(exp=3, base=2)
print(z) #8
```
**Function Argument mutability and ownership**
Function arguments are immutable references by defualt. This ensures memory safe and avoiding a copy.
This default behavior is called `borrowing` and can be explicitly defined using keyword `borrowed`.
```python
fn add(borrowed x: Int, borrowed y: Int) -> Int:
    return x + y
```

If you want the arguments to be modified within the function. Use keyword `inout` for arguments declaration.
Changes made in the function are also visible outside the function.
```python
fn add_inout(inout x: Int, inout y: Int) -> Int:
    x += 1
    y += 1
    return x + y

fn main():
    var a = 1
    var b = 2
    let c = add_inout(a, b)
    print(a) # 2
    print(b) # 3
    print(c) # 5
```

`owned` keyword provides the function with full ownership of the value. ‵text‵ is a copy of original `a` and can be modified without affecting `a`.
```python
fn set_fire(owned text: String) -> String:
    text += "🔥"
    return text

fn main():
    let a: String = "mojo"
    let b = set_fire(a)
    print(a) # mojo
    print(b) # mojo🔥
```

If you want to give the function ownership of a value and do not want to make a copy (memory efficient). Use `^` transfer operator.
The transfer operator will destroy local variable, in this case `a`. Any later operations that use `a` will cause compiler errors.
```python
fn set_fire(owned text: String) -> String:
    text += "🔥"
    return text

fn main():
    let a: String = "mojo"
    let b = set_fire(a^)
    print(a) # error, a no longer exists
    print(b) # mojo🔥
```

**Struct in Mojo**
A `struct` is similar to `class`. It supports method, filed, overloading, etc.
Mojo structs are completely static—they are bound at compile-time.
```python
struct Base:
    var a: Int
    var b: Int

    fn __init__(inout self, a: Int, b: Int):
        self.a = a
        self.b = b
    
    fn print(self):
        print(self.a, self.b)

fn main():
    let obj = Base(1, 2)
    obj.print() # 1 2
```

**Python integration**
Use `Python Numpy` modules in Mojo. If you encounter errors, this may help. [https://github.com/modularml/mojo/issues/551](https://github.com/modularml/mojo/issues/551)
```python
from python import Python

var np: PythonObject = None

fn main():
    try:
        np = Python.import_module("numpy")
        let ar = np.arange(15).reshape(3, 5)
        print(ar)
        print(ar.shape)
    except:
        pass

# [[ 0  1  2  3  4]
#  [ 5  6  7  8  9]
#  [10 11 12 13 14]]
# (3, 5)

```

# References
- https://docs.modular.com/mojo/
