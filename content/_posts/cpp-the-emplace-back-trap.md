---
title: The emplace_back() Trap
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/baby.png
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
date: 2025-08-27 21:49:28
tags: [cpp]
categories:
- cpp
---

A not-so-obvious caveat when using emplace_back()

<!-- more -->

To reproduce the issue i recently came across, here is the smallest self-contained example showing the problem.

```cpp
struct Sample {
  int value;
  int* alias;

  explicit Sample(int val = 0) : value(val), alias(&value) {}
};

std::ostream& operator<<(std::ostream& os, const Sample& sample) {
  os << "{ value=" << sample.value
     << " , alias=" << sample.alias
     << " , &value=" << &sample.value << " }";
  return os;
}

int main() {
  std::vector<Sample> vec;

  vec.emplace_back(1);
  std::cout << "after 1st emplace: vec[0] " << vec[0] << "\n";

  // memroy reallocation
  vec.emplace_back(2);
  std::cout << "after 1st emplace: vec[0] " << vec[0] << "\n";

  // WARNING: Dereferencing vec[0].alias here is undefined behavior.
  std::cout << "*alias = " << *(vec[0].alias) << "\n";
}
```

output:
```
after 1st emplace: vec[0] { value=1 , alias=0x5a1202d0d2b0 , &value=0x5a1202d0d2b0 }
after 1st emplace: vec[0] { value=1 , alias=0x5a1202d0d2b0 , &value=0x5a1202d0e2e0 }
*alias = -1591726835
```

The issue is:
When calling `emplace_back()`, memory will be reallocated to fit more data, and elements will be copied/moved to new addresses. However, `float* alias` is just copied/moved as a raw address, meaning its value will not be modified.

To fix this issue, we can explicitly override the default copy/move constructors that compilers generate.

```cpp
struct Sample {
  int value = 0;
  int* alias = &value;

  Sample() = default;
  explicit Sample(int v) : value(v), alias(&value) {}

  // Rebind alias for copies
  Sample(const Sample& rhs) : value(rhs.value), alias(&value) {}
  Sample& operator=(const Sample& rhs) {
    value = rhs.value; 
    alias = &value; 
    return *this;
  }
  // Rebind alias for moves
  Sample(Sample&& rhs) noexcept : value(rhs.value), alias(&value) {}
  Sample& operator=(Sample&& rhs) noexcept {
    value = rhs.value; 
    alias = &value; 
    return *this;
  }
};

std::ostream& operator<<(std::ostream& os, const Sample& sample) {
  os << "{ value=" << sample.value
     << " , alias=" << sample.alias
     << " , &value=" << &sample.value << " }";
  return os;
}

int main() {
  std::vector<Sample> vec;

  vec.emplace_back(1);
  std::cout << "after 1st emplace: vec[0] " << vec[0] << "\n";

  // memroy reallocation
  vec.emplace_back(2);
  std::cout << "after 1st emplace: vec[0] " << vec[0] << "\n";

  // WARNING: Dereferencing vec[0].alias here is undefined behavior.
  std::cout << "*alias = " << *(vec[0].alias) << "\n";
}
```

output:
```
after 1st emplace: vec[0] { value=1 , alias=0x5eee05be82b0 , &value=0x5eee05be82b0 }
after 1st emplace: vec[0] { value=1 , alias=0x5eee05be92e0 , &value=0x5eee05be92e0 }
*alias = 1
```

It’s not just `emplace_back`: operations such as `push_back`, `insert`, `emplace`, and `resize` can also expose the issue if they involve rearranging the container’s data.