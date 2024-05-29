---
title: BFS Template
author: Joe Chu
date: 2024-05-24 14:46:26
tags: [bfs]
categories:
- interview
---

A generic template.

<!-- more -->

```c++
struct Coord {
    int x;
    int y;
};

std::queue<Coord> q; // q contains locations we will visit.

q.push({i,j}); // Add a starting point to the queue.
visited[i][j] = 1; // Mark as visited.

std::vector<int> ds{0, 1, 0, -1, 0}; // In a 2D matrix, this is helpful for iterating four adjacent directions.

while (!q.empty()) {
    int size = q.size();
    while (size--) { // Iterating all the data in current level.
        Coord coords = q.front();
        int x = coords.x;
        int y = coords.y;
        q.pop(); // Remove current node.

        for (int i = 0; i < 4; i++) { // Start looking for neighbors
            int nx = x + ds[i];
            int ny = y + ds[i+1];

            // Skip out-of-bound data and visited data.
            if (nx < 0 || nx >= m || ny < 0 || ny >= n) continue;
            if (visited[nx][ny] == 1) continue;

            // Add new data to the queue and mark as visited
            q.push({nx,ny});
            visited[nx][ny] = 1;
        }
    }
}
```