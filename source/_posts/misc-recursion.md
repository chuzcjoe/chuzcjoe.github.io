---
title: Recursion Template
author: Joe Chu
date: 2024-05-28 14:44:29
tags:
---

1. Memorization
2. Divide and conquer
3. Backtracking

<!-- more -->

# 1. Memorization

To avoid duplicate calculation in subproblems.

```cpp
class Solution {
private:
    std::unordered_map<int, int> _map; // Use a map to keep previous results.
public:
    int memorizatio(int n) {
        // Check if the answer has been calculated.
        if (_map.find(n) != _map.end())
            return _map[n];
        
        int ans = 0;

        // Base case
        // ans = ...

        // Recursion relation
        // ans = ...

        // Save results
        _map[n] = ans;

        return ans;
    }
};
```

# 2. Divide and Conquer

1. **Divide** Divide the problem $S$ into subproblems ${S_1, S_2, ...S_n}$, where $n >= 2$.
2. **Conquer** Solve each subproblem.
3. **Combine** Combine the results of each subproblem.

```cpp
bool divideAndConquer(S) {
    // Base case
    // 1. Null detection
    // 2. Solve the minimal subproblem

    // Divide the problem and solve subproblems
    bool res1 = divideAndConquer(S1);
    bool res2 = divideAndConquer(S2);
    // ...

    // Return combine results
    return combine(res1, res2);
}
```

# 3. Backtracking

```cpp
void backtracking(candidate) {
    // Return if candidate is valid.
    if (candidate)
        return;

    // Iterate all possible candidates.
    for (auto candi : candidates) {
        if (candi) {
            // 1. Modify candi
            // 2. Run backtracking
            backtracking(modified(candi));
            // 3. Revert the change
            revert(candi);
        }
    }
}
```