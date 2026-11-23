---
title: C++ Insights Tool
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
date: 2025-01-16 17:03:12
tags: [cpp]
categories:
- cpp
---

C++ Insights is an open-source tool that transforms C++ source code into a representation closer to what compiler sees and generates. It helps understand the underlying details of C++.

<!-- more -->

# 1. Introduction

Online version: https://cppinsights.io/

A binary release is available, allowing you to install the tool on your local machine. Upon opening it in the browser, a default example is displayed, demonstrating its capabilities. The left pane shows the input C++ source code, while the right pane presents the translated version enriched with additional information.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cpp/cpp-insights-tool/tool.png" title="Image 1" width="800px" height="700px">
</p>

# 2. Translating range-based for loop

```cpp before.cpp
int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    for (int num : numbers) {
        std::cout << num << " ";
    }
    return 0;
}
```

```cpp after.cpp
int main()
{
  std::vector<int, std::allocator<int> > numbers = std::vector<int, std::allocator<int> >{std::initializer_list<int>{1, 2, 3, 4, 5}, std::allocator<int>()};
  {
    std::vector<int, std::allocator<int> > & __range1 = numbers;
    __gnu_cxx::__normal_iterator<int *, std::vector<int, std::allocator<int> > > __begin1 = __range1.begin();
    __gnu_cxx::__normal_iterator<int *, std::vector<int, std::allocator<int> > > __end1 = __range1.end();
    for(; __gnu_cxx::operator!=(__begin1, __end1); __begin1.operator++()) {
      int num = __begin1.operator*();
      std::operator<<(std::cout.operator<<(num), " ");
    }
    
  }
  return 0;
}
```

# 3. Translating template instantiation

Let's test a fold expression.

```cpp before.cpp
template<typename T, typename... Ts>
auto average(T value, Ts... values) {
    auto n = (1. + sizeof...(Ts));
    return ((value / n) + ... + (values / n)); // (init op ... op pack)
}

int main() {
    std::cout << average(1.0, 2.0, 3.0);
    return 0;
}
```

```cpp after.cpp
template<typename T, typename ... Ts>
auto average(T value, Ts... values)
{
  double n = (1.0 + static_cast<double>(sizeof...(Ts)));
  return ((value / n) + ... + (values / n));
}

#ifdef INSIGHTS_USE_TEMPLATE
template<>
double average<double, double, double>(double value, double __values1, double __values2)
{
  double n = (1.0 + static_cast<double>(2));
  return ((value / n) + (__values1 / n)) + (__values2 / n);
}
#endif


int main()
{
  std::cout.operator<<(average(1.0, 2.0, 3.0));
  return 0;
}
```

# 4. Translating Lambda expression

```cpp before.cpp
int main() {
    auto add = [](int a, int b) { return a + b; };
    std::cout << add(3, 4) << std::endl;
    return 0;
}
```

```cpp after.cpp
int main()
{
    
  class __lambda_5_16
  {
    public: 
    inline /*constexpr */ int operator()(int a, int b) const
    {
      return a + b;
    }
    
    using retType_5_16 = int (*)(int, int);
    inline constexpr operator retType_5_16 () const noexcept
    {
      return __invoke;
    };
    
    private: 
    static inline /*constexpr */ int __invoke(int a, int b)
    {
      return __lambda_5_16{}.operator()(a, b);
    }
    
    
  };
  
  __lambda_5_16 add = __lambda_5_16{};
  std::cout.operator<<(add.operator()(3, 4)).operator<<(std::endl);
  return 0;
}
```

# 5. Translating implicit conversion

In order to show implicit conversion, we need to enable `Show all implicit casts` in the dropdown list.

```cpp before.cpp
void func(double i) {}

int main() {
    func(3);
  	unsigned int a = 1u;
  	char buff[3] = {1, 2};
    return 0;
}
```

```cpp after.cpp
void func(double i)
{
}

int main()
{
  func(static_cast<double>(3));
  unsigned int a = 1U;
  char buff[3] = {static_cast<char>(1), static_cast<char>(2), '\0'};
  return 0;
  /* buff // lifetime ends here */
  /* a // lifetime ends here */
}
```

# 5. Translating conversion operator

```cpp before.cpp
struct A {};

struct B {
	operator A() {return {};}
};

void func(const A& a) {}

int main() {
  	B b;
    A a = b;
 
  	func(B{});
    return 0;
}
```

```cpp after.cpp
struct A
{
};


struct B
{
  inline operator A ()
  {
    return {};
  }
  
  // inline constexpr B() noexcept = default;
};


void func(const A & a)
{
}

int main()
{
  B b;
  A a = b.operator A();
  func(static_cast<const A>(B{}.operator A()));
  return 0;
}
```

# 6. Translating auto-type deduction

```cpp before.cpp
#include <initializer_list>

auto a = 3;
const auto ca = a;
const auto& ra = a;

auto&& ref1 = a;
auto&& ref2 = ca;
auto&& ref3 = 3;

auto a1 = 3;
auto a2(3);
auto a3 = {1};
auto a4{3}; // narrowing check

int* p;
const int* cp;
const int* const ccp = cp;
auto b1 = p;
auto b2 = cp;
auto b3 = ccp;
```

```cpp after.cpp
#include <initializer_list>

int a = 3;
const int ca = a;
const int & ra = static_cast<const int>(a);

int & ref1 = a;
const int & ref2 = ca;
int && ref3 = 3;

int a1 = 3;
int a2 = 3;
std::initializer_list<int> a3 = std::initializer_list<int>{1};
int a4 = {3};

int * p;
const int * cp;
const int *const ccp = cp;
int * b1 = p;
const int * b2 = cp;
const int * b3 = ccp;
```

When using `auto`, the deduced type will:

- Preserve top-level const for references.
- Ignore top-level const for non-reference types.

Here, `ccp` is not a reference, so the top-level const (the const on the pointer itself) is ignored, while the low-level const (the const on the object being pointed to) is preserved.

# References
- https://www.youtube.com/watch?v=6A4dcKy46-Y