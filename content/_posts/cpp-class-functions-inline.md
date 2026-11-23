---
title: Class Functions inlining
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
date: 2025-01-30 21:27:28
tags: [cpp, inline]
categories:
- cpp
---

Today, while reading a book by Bjarne Stroustrup, I came across an interesting C++ fact that I hadn’t known before.

<!-- more -->

# 1. Introduction

Functions defined in a class are implicitly considered as `inline`, regardless of whether it it is `public`, `protected`, or `private`(access specifier does not affect).

This can be verified through C++ Insights: https://cppinsights.io/s/1a8f7945

```cpp source.cpp
class A {
public:
  void funcA() {
  	return;
  }

protected:
  void funcB() {
  	return;
  }
  
private:
  void funcC() {
  	return;
  }
};
```

```cpp translate.cpp
class A  /* size: 1, align: 1 */
{
  
  public: 
  inline void funcA()
  {
    return;
  }
  
  
  protected: 
  inline void funcB()
  {
    return;
  }
  
  
  private: 
  inline void funcC()
  {
    return;
  }
  
};
```

# 2. Out-of-Class Definition

If you define a function outside the class declaration, it is `not` inline by default.

```cpp source.cpp
class A {
  void funcA(); // declaration
};


// definition
void A::funcA() {
  return;
}
```

```cpp translate.cpp
class A  /* size: 1, align: 1 */
{
  void funcA();
  
};


void A::funcA()
{
  return;
}
```

Most of the time, in our project, we separate declarations and definitions into `.cpp` and `.h` files. In such case, functions are `not` inlined by default.

To make out-of-class definition inline, we need to use `inline` keyword explicitly.

```cpp example.cpp
class A {
public:
    inline void funcA();  // Explicitly inline
};

// Now it is inline
inline void A::funcA() {
    return;
}
```

# 3. Link-Time Optimization (LTO)

Modern compiler optimize function calls automatically using advanced strategies such as `Link-Time Optimization(LTO)`.

`LTO` enables cross-translation-unit optimizations, allowing functions defined in `.cpp` files to be inlined when beneficial.

To enable LTO, we can add a flag `-flto` to the build command when using **GCC/Clang** compilers.



# 4. Conclusion

1. Functions defined inside a class are implicitly inline.
2. Functions defined outside a class are NOT inline unless explicitly marked inline.
3. To enable inlining, either define inside the class or use inline in the definition.