---
title: ThreadPool 2
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
date: 2024-09-14 00:58:22
tags: [threadpool]
categories:
- cpp
---

Design a ThreadPool model with advanced features.

<!-- more -->

Previously, I wrote a post that implements a simplified ThreadPool model https://chuzcjoe.github.io/2024/03/24/cpp-threading-pool/

Based on that, in this post, we will designed a more advanced one. The requirements for the new ThreadPool model:
1. Each thread should have a unique name.
2. Each thread should have a task queue and can handle certain number of tasks. More incoming tasks will be discarded if the queue is full.
3. A new task will be queued based on its priority. Tasks with higher priority numbers will be executed first.
4. A new task should have some metainfo and will be sent to the matching thread for execution.


```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <functional>
#include <string>
#include <unordered_map>

struct TaskInfo {
    std::string threadName;
    int priority;
    std::string taskType;

    TaskInfo(std::string threadName, int priority, std::string taskType)
        : threadName(std::move(threadName)), priority(priority), taskType(std::move(taskType)) {}
};

class Task {
public:
    Task(TaskInfo metadata, std::function<void()> func)
        : metadata(std::move(metadata)), func(std::move(func)) {}

    void execute() { func(); }

    const TaskInfo& getMetadata() const { return metadata; }

private:
    TaskInfo metadata;
    std::function<void()> func;
};

struct CompareTask {
    bool operator()(const Task& t1, const Task& t2) {
        return t1.getMetadata().priority < t2.getMetadata().priority;
    }
};

class Worker {
public:
    Worker(std::string name, size_t maxTasks) 
        : name(std::move(name)), maxTasks(maxTasks), shouldStop(false) {}

    void start() {
        thread = std::thread(&Worker::run, this);
    }

    void stop() {
        {
            std::unique_lock<std::mutex> lock(mutex);
            shouldStop = true;
        }
        condition.notify_one();
        if (thread.joinable()) {
            thread.join();
        }
    }

    bool runTask(const Task& task) {
        std::unique_lock<std::mutex> lock(mutex);
        if (tasks.size() >= maxTasks) {
            std::cout << "Queue is full on thread: " << getName() << '\n';
            return false;
        }
        tasks.push(task);
        condition.notify_one();
        return true;
    }

    const std::string& getName() const { 
        return name; 
    }

private:
    void run() {
        while (true) {            
            std::unique_lock<std::mutex> lock(mutex);
            condition.wait(lock, [this]() { return shouldStop || !tasks.empty(); });
            if (shouldStop && tasks.empty()) {
                return;
            }
            auto task = tasks.top();
            tasks.pop();
            lock.unlock();
            task.execute();
        }
    }

    std::string name;
    size_t maxTasks;
    std::thread thread;
    std::priority_queue<Task, std::vector<Task>, CompareTask> tasks;
    std::mutex mutex;
    std::condition_variable condition;
    bool shouldStop;
};

class ThreadPool {
public:
    ThreadPool() {}

    ~ThreadPool() {
        for (auto& [_, worker] : workers) {
            worker->stop();
        }
    }

    void allocateThread(const std::string& name, size_t maxTasks) {
        if (workers.find(name) != workers.end()) {
            std::cout << "Thread with this name already exists\n";
            return;
        }
        auto worker = std::make_unique<Worker>(name, maxTasks);
        worker->start();
        workers[name] = std::move(worker);
    }

    bool runTask(const Task& task) {
        const std::string& threadName = task.getMetadata().threadName;
        auto it = workers.find(threadName);
        if (it != workers.end()) {
            return it->second->runTask(task);
        } else {
            // If no matching thread, try to assign to any available worker
            for (auto& [_, worker] : workers) {
                if (worker->runTask(task)) {
                    return true;
                }
            }
            return false; // All queues are full
        }
    }

private:
    std::unordered_map<std::string, std::unique_ptr<Worker>> workers;
};

// Example usage
int main() {
    ThreadPool pool;

    // Allocating named threads with max tasks
    pool.allocateThread("Thread1", 5);
    pool.allocateThread("Thread2", 3);
    pool.allocateThread("Thread3", 4);

    // Running tasks with different priorities and metadata
    pool.runTask(Task(TaskInfo("Thread2", 2, "TypeB"), 
                    []() { std::cout << "Task executed on thread 2 (priority 2)\n"; }));
    pool.runTask(Task(TaskInfo("Thread3", 3, "TypeC"), 
                    []() { std::cout << "Task executed on thread 3 (priority 3)\n"; }));
    pool.runTask(Task(TaskInfo("Thread1", 1, "TypeA"), 
                    []() { std::cout << "Task executed on thread 1 (priority 1)\n"; }));

    // Trying to run a task on a full queue
    for (int i = 10; i > 5; --i) {
        pool.runTask(Task(TaskInfo("Thread2", i, "TypeB"), 
                                       [i]() { std::cout << "Task executed on Thread 2 (priority " << i << ")\n"; }));
    }

    // Allow tasks to be processed
    std::this_thread::sleep_for(std::chrono::seconds(2));

    return 0;
}
```

```
Task executed on thread 3 (priority 3)
Task executed on thread 1 (priority 1)
Queue is full on thread: Thread2
Queue is full on thread: Thread2
Queue is full on thread: Thread2
Task executed on Thread 2 (priority 10)
Task executed on Thread 2 (priority 9)
Task executed on thread 2 (priority 2)
```