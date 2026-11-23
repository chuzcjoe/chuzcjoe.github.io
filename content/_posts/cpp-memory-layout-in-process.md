---
title: Memory Layout in C/C++
author: Joe Chu
tags:
  - memory layout
categories:
  - cpp
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
date: 2025-03-27 09:10:01
---


Memory layout of a process.

<!-- more -->

# 1. Process vs Program

When we talk about **memory layout**, we are referring to a **process**, not a program. So, what is the difference between these two?

| Term     | Description                                                               |
|----------|---------------------------------------------------------------------------|
| Program  | A static entity — a file on disk (ELF, PE, Mach-O, etc.). It contains code, data, metadata, but no allocated memory yet. It contains all the needed information and data to describe how to construct a process at runtime.|
| Process  | A dynamic instance of a program that is loaded into memory and being executed by the OS. It has an address space, threads, open file descriptors, etc. |

The memory layout essentially describes how the OS maps a **program's** components(code, data, etc.) into a **process's** virtual address space. The following diagram shows the full lifecycle of how a program creates a process with concrete memory layout.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/memory-layout/from-program-to-process.png" title="Image 1" width="800px" height="600px">
</p>

| Step     | Description                                                               |
|----------|---------------------------------------------------------------------------|
| Step1  | Program files are stored as bytes, nothing is loaded into the memory yet. |
| Step2  | The OS creates virtual address space and maps the executable to different segments, as well as dynamic linker and shared libraries. |
| Step3  | Different segments are loaded into memory. |
| Step4  | main() is used as execution entry point. Stack grows downwards while Heap grows upwards. |
| Step5  | The process exits by calling either eixt() or returning from main(). Allocated memory is released. |

# 2. Memory Layout

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/memory-layout/memory.png" title="Image 1" width="800px" height="600px">
</p>

Let's discuss each segment from bottom to top.

**Text/Code Segment**

This segments contains the compiled machine instructions which are loaded from the `.text` section of the ELF/PE/Mach-O file. Text/Code segment has read-only permission to prevent accidental modification. If we try to write to text/code segment, you will get a `Segmentation Fault`.

**Initialized Data Segment**

This segments holds all `external`, `global`, `static` and `const` variables whose values are explicitly initialized at the time when they are defined. We can further classify these variable into two categories: `read-write` and `read-only`. Since `const` variables can not be changed, they fall under `read-only` section. The rest types belong to `read-write` section, which means they can be modified during the execution.

For example, all the variables will be stored in this segment.
```cpp
int a = 1;
char* b = "Hello World";
const int c = 2;

int main() {
    static int d = 10; 
    // ...
    return 0;
}
```

**Uninitialized Data Segment (BSS)**

An uninitialized data segment is also known as bss (b​lock started by symbol). It stores `global` and `static` variables that are not initialized. Data in `BSS` will be set to be `0`(or `nullptr` for pointer types) by default. Because the values of these variables can be modified, so this is a read-write area.

**Heap**

Heap is used for dynamic memory allocation such as `malloc()`, `new`, etc. It grows and shrinks in the opposite direction of Stack. This is a `read-write` area.

**Stack**

Stack stores a variety of data types including `stack frame`, `local variables`, `arguments` and `return values`. A stack frame is a block of memory on the stack that is allocated for each function call. Each time you call a function, a new stack frame is pushed onto the stack.

Stack grows downwards and is a `read-write` area. Stack has a fixed maximum size, exceeding its max capacity will lead to `Stack Overflow`. The maximum stack size is usually configurable. Here is a summary of default stack size on different OS.

Linux (x86_64)	8 MB
Linux (arm)	256 KB ~ 1 MB
macOS	8 MB
Windows	1 MB
POSIX Thread (Linux pthread_create)	8 MB

We can check the default Stack size on Linux/Mac using command:
```bash
ulimit -s        # show stack size in KB
ulimit -s 16384  # set stack size to 16 MB (in KB)
```


# References
- https://stackoverflow.com/questions/62556670/why-using-memory-layout-for-running-a-c-program
- https://www.scaler.com/topics/c/memory-layout-in-c/