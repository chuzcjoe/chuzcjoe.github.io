---
title: Rule of Zero, Three, Five
author: Joe Chu
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
date: 2024-07-18 00:34:26
tags: [rule of 035]
categories:
- cpp
---

Guidelines for managing object resources.

<!-- more -->

# 1. Rule of Zero

1. If a class doesn't manage resources directly, it shouldn't declare any special member functions.
2. Rely on the compiler-generated defaults for these functions.

This simplifies the class design and reduces the likelihood of resource management bugs.

# 2. Rule of Three

A struct or class that manages resources should define these three special member functions:
1. Destructor
2. Copy constructor
3. Copy assignment

```cpp
class MyClass {
private:
    int* data;
    size_t size;
public:
    MyClass(size_t size) : data(new int[size]), size(size) {}
    
    ~MyClass() {
        delete[] data;
    }
    
    MyClass(const MyClass& other) : data(new int[other.size]), size(other.size) {
        std::copy(other.data, other.data + size, data);
    }
    
    MyClass& operator=(const MyClass& other) {
        if (this != &other) {
            delete[] data;
            size = other.size;
            data = new int[size];
            std::copy(other.data, other.data + size, data);
        }
        return *this;
    }
};
```

# 3. Rule of Five

It extends the Rule of Three to include move semantics.

1. Destructor
2. Copy constructor
3. Copy assignment operator
4. Move constructor
5. Move assignment operator

```cpp
class MyClass {
private:
    int* data;
    size_t size;
public:
    MyClass(size_t size) : data(new int[size]), size(size) {}
    
    ~MyClass() {
        delete[] data;
    }
    
    MyClass(const MyClass& other) : data(new int[other.size]), size(other.size) {
        std::copy(other.data, other.data + size, data);
    }
    
    MyClass& operator=(const MyClass& other) {
        if (this != &other) {
            delete[] data;
            size = other.size;
            data = new int[size];
            std::copy(other.data, other.data + size, data);
        }
        return *this;
    }
    
    MyClass(MyClass&& other) noexcept : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
    }
    
    MyClass& operator=(MyClass&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        return *this;
    }
};
```