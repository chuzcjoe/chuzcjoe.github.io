---
title: Binary Search Insertion With Duplicate Elements
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
date: 2024-09-15 00:20:47
tags: [binary search, insertion]
categories:
- interview
---

Left-most and right-most insertion with binary search.

<!-- more -->

# Introduction

Previously, I posted an article that introduces 3 different binary search templates: https://chuzcjoe.github.io/2024/05/22/misc-how-to-write-bug-free-binary-search/

Writing binary search code can be tricky, and without careful attention, it’s easy to end up in an infinite loop. Binary search for insertion is even more challenging, particularly when deciding how to adjust the left and right pointers under certain conditions. Fortunately, with the templates I've provided, you only need to make slight adjustments to adapt them for insertion purposes.

We will reuse the first provided template and make adjustment based on it.

```cpp
#include <iostream>
#include <vector>

int binaryInsertMostLeft(std::vector<int>& arr, int target) {
    int i = 0;
    int j = arr.size() - 1;
    while (i <= j) {
        int mid = (i + j) / 2;
        if (arr[mid] >= target) 
            j = mid - 1;
        else
            i = mid + 1;
    }
    return i;
}

int binaryInsertMostRight(std::vector<int>& arr, int target) {
    int i = 0;
    int j = arr.size() - 1;
    while (i <= j) {
        int mid = (i + j) / 2;
        if (arr[mid] > target) 
            j = mid - 1;
        else
            i = mid + 1;
    }
    return i;
}

int main() {
    std::vector<int> nums{1, 1, 2, 5, 5, 8, 10};
    std::cout << "insert to the most left position\n";
    int left = binaryInsertMostLeft(nums, 0);
    std::cout << "0 is inserted at index: " << left << '\n';
    left = binaryInsertMostLeft(nums, 1);
    std::cout << "1 is inserted at index: " << left << '\n';
    left = binaryInsertMostLeft(nums, 2);
    std::cout << "2 is inserted at index: " << left << '\n';
    left = binaryInsertMostLeft(nums, 3);
    std::cout << "3 is inserted at index: " << left << '\n';
    left = binaryInsertMostLeft(nums, 9);
    std::cout << "9 is inserted at index: " << left << '\n';
    left = binaryInsertMostLeft(nums, 11);
    std::cout << "11 is inserted at index: " << left << '\n';

    std::cout << "insert to the most right position\n";
    int right = binaryInsertMostRight(nums, 0);
    std::cout << "0 is inserted at index: " << right << '\n';
    right = binaryInsertMostRight(nums, 1);
    std::cout << "1 is inserted at index: " << right << '\n';
    right = binaryInsertMostRight(nums, 2);
    std::cout << "2 is inserted at index: " << right << '\n';
    right = binaryInsertMostRight(nums, 3);
    std::cout << "3 is inserted at index: " << right << '\n';
    right = binaryInsertMostRight(nums, 5);
    std::cout << "5 is inserted at index: " << right << '\n';
    right = binaryInsertMostRight(nums, 9);
    std::cout << "9 is inserted at index: " << right << '\n';
    right = binaryInsertMostRight(nums, 11);
    std::cout << "11 is inserted at index: " << right << '\n';
    return 0;
}
```

```
insert to the most left position
0 is inserted at index: 0
1 is inserted at index: 0
2 is inserted at index: 2
3 is inserted at index: 3
9 is inserted at index: 6
11 is inserted at index: 7
insert to the most right position
0 is inserted at index: 0
1 is inserted at index: 2
2 is inserted at index: 3
3 is inserted at index: 3
5 is inserted at index: 5
9 is inserted at index: 6
11 is inserted at index: 7
```

We tested the implementation across various cases, and all results were correct.

# Visualization

Only demonstrate left-most insertion. Right-most insertion is the same.

## Scenario1

The inserted number `x`: `a < x < b`

<p align="center">
    <img src="v1.png" title="A regular image" width="600px" height="600px">
</p>

## Scenario2

The inserted number `x`: `a == x < b`

<p align="center">
    <img src="v2.png" title="A regular image" width="350px" height="350px">
</p>

## Scenario3

The inserted number `x`: `a < x == b`

<p align="center">
    <img src="v3.png" title="A regular image" width="600px" height="600px">
</p>

## Scenario4

The inserted number `x`: `a == x == b`

<p align="center">
    <img src="v4.png" title="A regular image" width="350px" height="350px">
</p>