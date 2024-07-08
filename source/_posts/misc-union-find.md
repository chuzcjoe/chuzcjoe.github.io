---
title: Union Find Template
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
date: 2024-07-04 14:01:33
tags: [union find]
categories:
- interview
---

A generic template.

<!-- more -->

# 1. Introduction

The algorithm has two main functions:
- `find`: find a root parent given a node.
- `union`: merge a smaller set to a larger one if they are disjoint.

<p align="center">
    <img src="unionfind.png" title="A regular image" width="1000px" height="800px">
</p>

# 2. Template

```cpp
template<typename T>
class UnionFindSet {
public:
    UnionFindSet(T n) {
        _parents = std::vector<T>(n, 0);
        _ranks = std::vector<T>(n, 0);
        
        for (size_t i = 0; i < n; ++i)
            _parents[i] = i;
    }
    
    bool unite(T u, T v) {
        T pu = find(u);
        T pv = find(v);
        if (pu == pv) return false;
        
        if (_ranks[pu] > _ranks[pv]) {
            _parents[pv] = pu;
        } else if (_ranks[pv] > _ranks[pu]) {
            _parents[pu] = pv;
        } else {
            _parents[pu] = pv;
            ++_ranks[pv];
        }
 
        return true;
    }
    
    int find(T id) {        
        if (id != _parents[id])
            _parents[id] = find(_parents[id]);        
        return _parents[id];
    }
    
private:
    std::vector<T> _parents;
    std::vector<T> _ranks;
};
```