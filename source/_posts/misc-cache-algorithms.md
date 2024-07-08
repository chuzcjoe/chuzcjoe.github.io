---
title: Cache Algorithms and Implementations
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
date: 2024-07-06 19:57:46
tags: [cache]
categories:
- interview
---

Introduce some common CPU cache algorithms and their implementations.

<!-- more -->

# 1. LRU (Least Recent Used)

## 1.1 How it works

<p align="center">
    <img src="lru.png" title="A regular image" width="600px" height="600px">
</p>

## 1.2 Implementation

The key is to have a linked list that simulate a cache storage and a hashtable to keep track of the data in the cache.

<p align="center">
    <img src="lrustructure.png" title="A regular image" width="600px" height="600px">
</p>


```cpp
#include <iostream>
#include <unordered_map>
#include <list>

class LRUCache {
private:
    struct Node {
        int key;
        int value;
        Node(int k, int v) : key(k), value(v) {}
    };

    int capacity;
    std::list<Node> cacheList;  // Doubly linked list to store cache items
    std::unordered_map<int, std::list<Node>::iterator> cacheMap;  // Hash map to store key-node pairs

    void moveToFront(int key) {
        auto nodeIt = cacheMap[key];
        cacheList.splice(cacheList.begin(), cacheList, nodeIt);
    }

public:
    LRUCache(int cap) : capacity(cap) {}

    int get(int key) {
        if (cacheMap.find(key) == cacheMap.end()) {
            return -1;  // Key not found
        }
        moveToFront(key);
        return cacheList.begin()->value;
    }

    void put(int key, int value) {
        if (cacheMap.find(key) != cacheMap.end()) {
            auto nodeIt = cacheMap[key];
            nodeIt->value = value;
            moveToFront(key);
            return;
        }

        if (cacheMap.size() >= capacity) {
            int keyToRemove = cacheList.back().key;
            cacheList.pop_back();
            cacheMap.erase(keyToRemove);
        }

        cacheList.emplace_front(key, value);
        cacheMap[key] = cacheList.begin();
    }

    void display() const {
        for (const auto& node : cacheList) {
            std::cout << node.key << ": " << node.value << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    LRUCache cache(3);

    cache.put(1, 1);
    cache.put(2, 2);
    cache.put(3, 3);
    std::cout << "Initial cache:" << std::endl;
    cache.display();

    std::cout << "Get 1: " << cache.get(1) << std::endl;
    cache.display();

    cache.put(4, 4);
    std::cout << "Cache after adding 4:" << std::endl;
    cache.display();

    std::cout << "Get 2: " << cache.get(2) << std::endl;
    cache.display();

    cache.put(5, 5);
    std::cout << "Cache after adding 5:" << std::endl;
    cache.display();

    return 0;
}
```
```
Initial cache:
3: 3 2: 2 1: 1 
Get 1: 1
1: 1 3: 3 2: 2 
Cache after adding 4:
4: 4 1: 1 3: 3 
Get 2: -1
4: 4 1: 1 3: 3 
Cache after adding 5:
5: 5 4: 4 1: 1 
```

# 2. LFU (Least Frequently Used)

## 2.1 How it works

<p align="center">
    <img src="lfustructure.png" title="A regular image" width="800px" height="600px">
</p>

## 2.2 Implementation
```cpp
#include <iostream>
#include <unordered_map>
#include <list>
#include <vector>
#include <algorithm>

class LFUCache {
private:
    // Node structure to store key, value, and frequency
    struct Node {
        int key;
        int value;
        int freq;
        Node(int k, int v, int f) : key(k), value(v), freq(f) {}
    };
    
    int capacity;
    int minFreq;
    std::unordered_map<int, std::list<Node>::iterator> keyNodeMap; // Maps key to node
    std::unordered_map<int, std::list<Node>> freqListMap; // Maps frequency to list of nodes

public:
    LFUCache(int cap) : capacity(cap), minFreq(0) {}

    int get(int key) {
        if (keyNodeMap.find(key) == keyNodeMap.end()) {
            return -1; // Key not found
        }
        
        auto nodeIt = keyNodeMap[key];
        int value = nodeIt->value;
        int freq = nodeIt->freq;
        
        // Remove the node from the current frequency list
        freqListMap[freq].erase(nodeIt);
        if (freqListMap[freq].empty()) {
            freqListMap.erase(freq);
            if (minFreq == freq) {
                minFreq++;
            }
        }

        // Insert the node into the next frequency list
        freq++;
        freqListMap[freq].emplace_front(key, value, freq);
        keyNodeMap[key] = freqListMap[freq].begin();
        
        return value;
    }

    void put(int key, int value) {
        if (capacity == 0) return;
        
        if (keyNodeMap.find(key) != keyNodeMap.end()) {
            // Key already exists, update the value and frequency
            auto nodeIt = keyNodeMap[key];
            nodeIt->value = value;
            get(key); // Update frequency
            return;
        }
        
        if (keyNodeMap.size() >= capacity) {
            // Evict the least frequently used node
            auto nodeToEvict = freqListMap[minFreq].back();
            keyNodeMap.erase(nodeToEvict.key);
            freqListMap[minFreq].pop_back();
            if (freqListMap[minFreq].empty()) {
                freqListMap.erase(minFreq);
            }
        }

        // Insert the new node
        minFreq = 1;
        freqListMap[minFreq].emplace_front(key, value, minFreq);
        keyNodeMap[key] = freqListMap[minFreq].begin();
    }
};

int main() {
    LFUCache cache(2);

    cache.put(1, 1);
    cache.put(2, 2);
    std::cout << "Get 1: " << cache.get(1) << std::endl; // returns 1
    cache.put(3, 3); // evicts key 2
    std::cout << "Get 2: " << cache.get(2) << std::endl; // returns -1 (not found)
    std::cout << "Get 3: " << cache.get(3) << std::endl; // returns 3
    cache.put(4, 4); // evicts key 1
    std::cout << "Get 1: " << cache.get(1) << std::endl; // returns -1 (not found)
    std::cout << "Get 3: " << cache.get(3) << std::endl; // returns 3
    std::cout << "Get 4: " << cache.get(4) << std::endl; // returns 4

    return 0;
}
```
```
Get 1: 1
Get 2: -1
Get 3: 3
Get 1: -1
Get 3: 3
Get 4: 4
```

# 3. FIFO (First In First Out)

## 3.1 How it works

<p align="center">
    <img src="fifo.png" title="A regular image" width="600px" height="600px">
</p>

## 3.2 Implementation

```cpp
#include <iostream>
#include <unordered_map>
#include <queue>

class FIFOCache {
private:
    int capacity;
    std::queue<int> cacheQueue;  // Queue to store keys in the order they were added
    std::unordered_map<int, int> cacheMap;  // Hash map to store key-value pairs

public:
    FIFOCache(int cap) : capacity(cap) {}

    int get(int key) {
        if (cacheMap.find(key) == cacheMap.end()) {
            return -1;  // Key not found
        }
        return cacheMap[key];
    }

    void put(int key, int value) {
        if (cacheMap.size() >= capacity) {
            int keyToRemove = cacheQueue.front();
            cacheQueue.pop();
            cacheMap.erase(keyToRemove);
        }

        cacheQueue.push(key);
        cacheMap[key] = value;
    }

    void display() const {
        std::queue<int> tempQueue = cacheQueue;
        while (!tempQueue.empty()) {
            int key = tempQueue.front();
            tempQueue.pop();
            std::cout << key << ": " << cacheMap.at(key) << " ";
        }
        std::cout << std::endl;
    }
};

int main() {
    FIFOCache cache(3);

    cache.put(1, 1);
    cache.put(2, 2);
    cache.put(3, 3);
    std::cout << "Initial cache:" << std::endl;
    cache.display();

    std::cout << "Get 1: " << cache.get(1) << std::endl;
    cache.display();

    cache.put(4, 4);
    std::cout << "Cache after adding 4:" << std::endl;
    cache.display();

    std::cout << "Get 2: " << cache.get(2) << std::endl;
    cache.display();

    cache.put(5, 5);
    std::cout << "Cache after adding 5:" << std::endl;
    cache.display();

    return 0;
}
```
```
Initial cache:
1: 1 2: 2 3: 3 
Get 1: 1
1: 1 2: 2 3: 3 
Cache after adding 4:
2: 2 3: 3 4: 4 
Get 2: 2
2: 2 3: 3 4: 4 
Cache after adding 5:
3: 3 4: 4 5: 5 
```

# References

- https://zxi.mytechroad.com/blog/hashtable/leetcode-460-lfu-cache/#google_vignette