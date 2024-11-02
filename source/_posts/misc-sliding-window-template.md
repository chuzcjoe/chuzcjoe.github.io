---
title: Sliding Window Template
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
date: 2024-10-20 00:29:18
tags: [sliding window]
categories:
- interview
---

A generic sliding window template.

<!-- more -->

# 1. Template

```cpp
int sliding_window_template(const vector<int>& arr, int k) {
    int n = arr.size();
    int left = 0, right = 0;
    int max_result = 0;  // variable to store the result

    // Optionally, you might need additional data structures like a map or set.
    unordered_map<int, int> window;

    // Expand the window by moving the 'right' pointer
    for (; right < n; right++>) {
        // Add the current element to the window
        window[arr[right]]++;
        
        // Shrink the window if necessary
        while (/* some condition related to the problem */) {
            // Remove the leftmost element from the window
            window[arr[left]]--;
            if (window[arr[left]] == 0) {
                window.erase(arr[left]);
            }
            left++;  // Shrink the window from the left
        }

        // Calculate or update the result using the current window
        max_result = max(max_result, right - left + 1);

        // Move the 'right' pointer to expand the window
        right++;
    }

    return max_result;  // return the result
}
```

A shorter version:
```cpp
int fn(vector<int>& arr) {
    int left = 0, ans = 0, curr = 0;

    for (int right = 0; right < arr.size(); right++) {
        // do logic here to add arr[right] to curr

        while (WINDOW_CONDITION_BROKEN) {
            // remove arr[left] from curr
            left++;
        }

        // update ans
    }

    return ans;
}
```

# 2. Examples

## 2.1 LeetCode 3. Longest Substring Without Repeating Characters

Problem Statement: Given a string s, find the length of the longest substring without repeating characters.

```cpp
int lengthOfLongestSubstring(string s) {
    unordered_map<char, int> window;
    int left = 0, right = 0;
    int max_len = 0;

    while (right < s.size()) {
        char c = s[right];
        window[c]++;

        // Shrink the window if there is a duplicate character
        while (window[c] > 1) {
            char left_char = s[left];
            window[left_char]--;
            left++;
        }

        max_len = max(max_len, right - left + 1);
        right++;
    }

    return max_len;
}
```

## 2.2 LeetCode 209. Minimum Size Subarray Sum

Problem Statement: Given an array of positive integers nums and a positive integer target, find the minimal length of a contiguous subarray of which the sum is greater than or equal to target. If there is no such subarray, return 0 instead.

```cpp
int minSubArrayLen(int target, vector<int>& nums) {
    int left = 0, sum = 0, min_len = INT_MAX;

    for (int right = 0; right < nums.size(); ++right) {
        sum += nums[right];

        // Shrink the window until the sum is smaller than the target
        while (sum >= target) {
            min_len = min(min_len, right - left + 1);
            sum -= nums[left];
            left++;
        }
    }

    return min_len == INT_MAX ? 0 : min_len;
}
```

## 2.3 LeetCode 567. Permutation in String

Problem Statement: Given two strings s1 and s2, return true if s2 contains a permutation of s1. In other words, one of s1's permutations is a substring of s2.

```cpp
bool checkInclusion(string s1, string s2) {
    if (s1.size() > s2.size()) return false;

    vector<int> s1_count(26, 0), window(26, 0);

    // Initialize the character counts for s1 and the first window in s2
    for (int i = 0; i < s1.size(); ++i) {
        s1_count[s1[i] - 'a']++;
        window[s2[i] - 'a']++;
    }

    // Slide the window across s2
    for (int i = s1.size(); i < s2.size(); ++i) {
        if (window == s1_count) return true;

        // Slide the window: remove the left character and add the right one
        window[s2[i] - 'a']++;
        window[s2[i - s1.size()] - 'a']--;
    }

    // Check the final window
    return window == s1_count;
}
```