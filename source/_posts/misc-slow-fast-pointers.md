---
title: Slow and Fast Pointers
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
date: 2024-10-20 23:06:42
tags: [slow fast pointers]
categories:
- interview
---

Commonly used to detect cycles or find the middle of a list.

<!-- more -->

# 1. Template

```cpp
int fn(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    int ans = 0;

    while (fast != nullptr && fast->next != nullptr) {
        // do logic
        slow = slow->next;
        fast = fast->next->next;
    }

    return ans;
}
```

# 2. Detect Cycles, LeetCode 141

```cpp
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// Example: Detecting a cycle in a linked list using fast and slow pointers
bool hasCycle(ListNode* head) {
    if (head == nullptr || head->next == nullptr) return false;

    ListNode* slow = head;
    ListNode* fast = head->next;

    while (slow != fast) {
        if (fast == nullptr || fast->next == nullptr) return false;
        slow = slow->next;
        fast = fast->next->next;
    }

    return true;
}
```

# 3. Find the Middle of a Linked List, LeetCode 876

Problem: Given the head of a singly linked list, return the middle node of the linked list. If there are two middle nodes, return the second middle node.

```cpp
ListNode* middleNode(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    
    while (fast != nullptr && fast->next != nullptr) {
        slow = slow->next;
        fast = fast->next->next;
    }
    
    return slow;  // When fast reaches the end, slow will be at the middle
}
```

# 4. Happy Number, LeetCode 202

A number is considered happy if repeatedly summing the squares of its digits leads to 1. If it enters a cycle that doesn't include 1, it’s not a happy number.

```cpp
int sumOfSquares(int n) {
    int sum = 0;
    while (n) {
        int digit = n % 10;
        sum += digit * digit;
        n /= 10;
    }
    return sum;
}

bool isHappy(int n) {
    int slow = n;
    int fast = sumOfSquares(n);

    while (fast != 1 && slow != fast) {
        slow = sumOfSquares(slow);
        fast = sumOfSquares(sumOfSquares(fast));
    }

    return fast == 1;
}
```
