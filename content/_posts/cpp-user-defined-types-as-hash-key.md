---
title: User-defined Types as Hash Keys in C++
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
date: 2025-10-03 22:06:46
tags: [cpp, hash]
categories:
- cpp
---

User-defined types can not be used as keys in containers like std::unordered_map unless we provide some extra features to them.

<!-- more -->

First, we need to figure out what does hashmap do under the hood. There are two important features in hashmap structure.
1. To find out where to put the key-value pairs in the hash table.
2. How to tell if two keys are identical.

That's exactly what we need to provide to our user-defined types to help hash map do its work easily. Basically, We need to implement these two:

1. A equality operator.
2. A hash function.

If we directly use struct `Pointer` as the key type in `std::unordered_map`, we will get tons of compile errors.

```cpp
struct Point {
    int x, y;
};

std::unordered_map<Point, int> map;
```

To make the `Point` type hashable, we need to modify the code to be:
```cpp
struct Point {
    int x, y;

    bool operator==(const Point& other) const {
        return other.x == x && other.y == y;
    }
};

template<>
struct std::hash<Point> {
    std::size_t operator()(const Point& p) const noexcept {
        std::size_t h1 = std::hash<int>{}(p.x);
        std::size_t h2 = std::hash<int>{}(p.y);
        return h1 ^ (h2 + 0x9e3779b97f4a7c15ULL + (h1<<6) + (h1>>2));
    }
};

int main() {
    std::unordered_map<Point, int> map;
    map[{1, 2}] = 1;
    std::cout << "key: {1, 2}, value: " << map[{1, 2}] << std::endl;
    map[{1, 2}] = 3;
    std::cout << "key: {1, 2}, value: " << map[{1, 2}] << std::endl;
}
```

```
output:

key: {1, 2}, value: 1
key: {1, 2}, value: 3
```
