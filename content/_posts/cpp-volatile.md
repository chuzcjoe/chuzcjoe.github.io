---
title: Volatile in C++
author: Joe Chu
date: 2024-05-24 23:07:24
tags: [volatile]
categories:
- cpp
---

Understand volatile from assembly perspective.

<!-- more -->

# 1. Introduction

When we declare a variable as `volatile`, it indicates that its value might be altered by external factors such as hardware, other threads, or signal handlers. A volatile variable cannot be optimized by the compiler, ensuring that the only way to obtain its value is by accessing its memory address directly.

# 2. Examples

Let's try a simple example first and optimize it with `-O3` option.

**C++**

```c++
int main() {
    int age = 1;
    age = 2;
    return 0;
}
```

**Assembly**

```assembly
main:
        xor     eax, eax
        ret
```

Since `-O3` perform aggresive optimization and the compiler recognizes that `age` is only assigned and reassigned within the scope of main, and its value is never used afterward. Therefore, both the initial and subsequent assignments to age are redundant. The optimized code will eliminate the age variable entirely.

But when we declare age as `volatile`.

**C++**

```c++
int main() {
    volatile int age = 1;
    age = 2;
    return 0;
}
```

**Assembly**

```assembly
main:
        mov     DWORD PTR [rsp-4], 1
        xor     eax, eax
        mov     DWORD PTR [rsp-4], 2
        ret
```

Any modification to a volatile variable directly accesses its memory address. The compiler does not optimize volatile variables.