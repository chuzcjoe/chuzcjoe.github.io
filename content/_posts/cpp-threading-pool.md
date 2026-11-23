---
title: Theading Pool
author: Joe Chu
date: 2024-03-24 16:21:20
tags: [cpp, threading]
categories:
- cpp
---

1. Basic threading pool
2. Advanced threading pool

<!-- more -->

# 1. Basic Threading Pool

In a simple threading pool setup, there's a set number of threads and a queue for tasks. Tasks are processed in a first-in, first-out (FIFO) manner. Any idle threads will promptly handle the task at the front of the queue.

A few things to note.
1. Line 22 added predicate to prevent spurious wakeup.
2. Once the thread is blocked by the wait(), will automatically call lock.unlock()

```c++
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <functional>
#include <chrono>

class ThreadPool {
private:
    std::mutex queueMutex;
    std::condition_variable condition;
    bool stop;
    std::vector<std::thread> workers;
    std::queue<std::function<void()>> tasks;
public:
    ThreadPool(size_t num) : stop(false) {
        for (size_t i = 0; i < num; i++) {
            workers.emplace_back([this]{
                for(;;) {
                    std::unique_lock<std::mutex> lock(queueMutex);
                    condition.wait(lock, [this]{return stop || !tasks.empty();});
                    if (stop && tasks.empty()) return;
                    auto task = std::move(tasks.front());
                    tasks.pop();
                    lock.unlock();
                    task();
                }
            });
        }
        
    }
    
    ~ThreadPool() {
        std::cout << "~ThreadPool() start\n";
        std::unique_lock<std::mutex> lock(queueMutex);
        stop = true;
        lock.unlock();
        condition.notify_all();
        for (auto& worker : workers)
            worker.join();
        std::cout << "~ThreadPool() end\n";
    }
    
    template<class F>
    void enqueue(F&& task) {
        std::unique_lock<std::mutex> lock(queueMutex);
        tasks.emplace(std::forward<F>(task));
        lock.unlock();
        condition.notify_one();
        std::cout << "notify thread...\n";
    }
};

int main() {
    ThreadPool pool(3);
    
    std::cout << "adding tasks\n";
    for (int i = 0; i < 15; i++) {
        pool.enqueue([i](){
            std::cout << "Task " << i << " executed by thread " << std::this_thread::get_id() << std::endl;
            std::this_thread::sleep_for(std::chrono::seconds(1));
        });
    }
    std::cout << "finish adding tasks\n";

    std::cout << "This is main thread running\n";

    return 0;
}
```

# Advanced Threading Pool

A sophisticated threading pool implementation employs a design where each individual thread is assigned its own distinct task queue. Tasks are added to these queues, and each thread processes the tasks present in its corresponding queue in sequential order.

```c++
#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <functional>
#include <chrono>
#include <vector>

class ThreadPool {
private:
    std::mutex queueMutex;
    std::condition_variable condition;
    bool stop;
    std::vector<std::thread> workers;
    std::vector<std::queue<std::function<void()>>> taskQueues;

public:
    ThreadPool(size_t num) : stop(false), taskQueues(num) {
        for (size_t i = 0; i < num; i++) {
            workers.emplace_back([this, i] {
                for (;;) {
                    std::unique_lock<std::mutex> lock(queueMutex);
                    condition.wait(lock, [this, i] { return stop || !taskQueues[i].empty(); });
                    if (stop && taskQueues[i].empty())
                        return;
                    auto task = std::move(taskQueues[i].front());
                    taskQueues[i].pop();
                    lock.unlock();
                    task();
                }
            });
        }
    }

    ~ThreadPool() {
        {
            std::unique_lock<std::mutex> lock(queueMutex);
            stop = true;
        }
        condition.notify_all();
        for (auto& worker : workers)
            worker.join();
    }

    template <class F>
    void enqueue(F&& task, size_t queueIndex = 0) {
        std::unique_lock<std::mutex> lock(queueMutex);
        taskQueues[queueIndex].emplace(std::forward<F>(task));
        lock.unlock();
        condition.notify_one();
    }
};

int main() {
    ThreadPool pool(3);

    std::cout << "adding tasks\n";
    for (int i = 0; i < 15; i++) {
        pool.enqueue([i]() {
            std::cout << "Enqueued Task " << i << " to Queue " << i % 3 << ", and executed by thread " << std::this_thread::get_id() << std::endl;
            std::this_thread::sleep_for(std::chrono::seconds(1));
        }, i % 3); // Distribute tasks evenly across the threads
    }
    std::cout << "finish adding tasks\n";

    std::cout << "This is main thread running\n";

    return 0;
}

```