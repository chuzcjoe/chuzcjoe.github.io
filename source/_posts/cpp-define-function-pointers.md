---
title: C++ Function Pointers
author: Joe Chu
toc: true
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
date: 2024-09-10 20:12:29
tags: [function pointers]
categories:
- cpp
---

Introduce 4 ways to define function pointers in C++.
1. Traditional
2. typedef
3. using
4. std::function

<!-- more -->

# 1. Traditional

**Syntax**
```c++
return_type (*pointer_name)(parameter_types1, parameter_types2);

// example
int (*funcPtr)(int, int);
```

# 2. typedef

**Syntax**
```c++
typedef return_type (*pointer_name)(parameter_types1, parameter_types2);

// example
typedef int (*funcPtr)(int, int);
```

`funcPtr` becomes an alias for the type "pointer to a function that takes two int parameters and returns an int".

# 3. using

**Syntax**
```c++
using pointer_name = return_type (*)(parameter_types1, parameter_types2);

// example
using funcPtr = int (*)(int, int)
```

`funcPtr` becomes an alias for the type "pointer to a function that takes two int parameters and returns an int".

# 4. std::function

**Syntax**
```c++
std::function<return_type(parameter_types1, parameter_types2)> pointer_name;

// example
std::function<int(int, int)> funcPtr;
```

# 5. Example

```c++
#include <iostream>
#include <functional>

int add(int a, int b) {
    return a + b;
}

int main() {
    // 1. traditional
    int (*funcPtr1)(int, int);
    funcPtr1 = add;
    std::cout << funcPtr1(1, 2) << '\n';

    // 2. typedef
    typedef int (*AddFunc_typedef)(int, int);
    AddFunc_typedef funcPtr2 = add;
    std::cout << funcPtr2(1, 2) << '\n';

    // 3. using
    using AddFunc_using = int (*)(int, int);
    AddFunc_using funcPtr3 = add;
    std::cout << funcPtr3(1, 2) << '\n';

    // 4. std::function
    std::function<int(int, int)> funcPtr4 = add;
    std::cout << funcPtr4(1, 2) << '\n';

    return 0;
}
```