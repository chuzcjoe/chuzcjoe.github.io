---
title: How to Write Bug Free Binary Search
author: Joe Chu
date: 2024-05-22 14:49:06
tags: [binary search]
categories:
- interview
---

Introduce common templates to avoid infinite loops.

<!-- more -->

# Template 1

```c++
int i = 0;
int j = nums.size() - 1;
while (i <= j) {
    int mid = (i + j) / 2;
    if (nums[mid] == target) 
        return mid;
    else if (nums[mid] < target) 
        i = mid + 1;
    else 
        j = mid - 1;
}

return -1; // not found
```

# Template 2

```c++
int i = 0;
int j = nums.size();

while (i < j) {
    int mid = (i + j) / 2;
    if (nums[mid] == target) 
        return mid;
    else if (nums[mid] < target) 
        i = mid + 1;
    else 
        j = mid;
}

// post-process
if (i != nums.size() && nums[i] == target) 
    return i;

return -1;
```

# Template 3

```c++
int i = 0;
int j = nums.size() - 1;

while (i + 1 < j) {
    int mid = (i + j) / 2;
    if (nums[mid] == target)
        return mid;
    else if (nums[mid] < target)
        i = mid;
    else
        j = mid;
}

if (nums[i] == target)
    return i;
if (nums[j] == target)
    return j;

return -1;
```

# Visualization

<p align="center">
    <img src="visual.png" title="A regular image" width="800px" height="500px">
</p>

# Overflow

To deal with the overflow issue, we need to compute $mid$ using:

```c++
int mid = i + (j - i) / 2;
```