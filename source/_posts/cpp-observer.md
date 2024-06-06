---
title: Observer Design Pattern
author: Joe Chu
date: 2024-06-06 11:44:52
tags: [observer, design pattern]
categories:
- cpp
---

Design pattern.

<!-- more -->

# 1. Introduction

The Observer design pattern is a behavioral pattern that defines a one-to-many relationship between objects. When one object (the subject) changes state, all its dependents (observers) are notified and updated automatically. 

<p align="center">
    <img src="observer.png" title="A regular image" width="800px" height="500px">
</p>

# 2. Example

A classic example of the Observer design pattern is a `Publisher-Subscriber` system.

1. The Publisher is a single entity responsible for sending messages and can add or remove multiple subscribers.
2. Multiple subscribers listen for message notifications from the publisher.

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

class Observer;

// Subject(abstract)
class Subject {
public:
    virtual void attach(Observer* o) = 0;
    virtual void detach(Observer* o) = 0;
    virtual void notify(const std::string& message) const = 0;
};

// Observer(abstract)
class Observer {
public:
    virtual void update(const std::string& message) = 0;
    virtual std::string getSubscriberName() const = 0;
};

// Concrete subject
class Publisher : public Subject {
public:
    void attach(Observer* o) override {
        std::cout << "User " << o->getSubscriberName() << " subscribed\n";
        _obs.push_back(o);
    }
    void detach(Observer* o) override {
        std::cout << "User " << o->getSubscriberName() << " unsubscribed\n";
        _obs.erase(std::remove(_obs.begin(), _obs.end(), o), _obs.end());
    }
    void notify(const std::string& message) const override {
        for (auto ob : _obs) {
            ob->update(message);
        }
    }
private:
    std::vector<Observer*> _obs;
};

// Concrete oberver
class Subscriber : public Observer {
public:
    Subscriber(const std::string& name) : _name(name) {}
    void update(const std::string& message) {
        std::cout << "Subscriber " << _name << " received message: " << message << '\n';
    }
    std::string getSubscriberName() const {
        return _name;
    }
private:
    std::string _name;
};

int main() {
    Subscriber s1("A");
    Subscriber s2("B");
    Subscriber s3("C");

    Publisher p;
    p.attach(&s1);
    p.attach(&s2);
    p.attach(&s3);

    p.notify("Morning news.");
    p.notify("Noon news.");
    p.notify("Evening news.");

    p.detach(&s2);
    p.notify("Late night news");
    
    return 0;
}
```

```
User A subscribed
User B subscribed
User C subscribed
Subscriber A received message: Morning news.
Subscriber B received message: Morning news.
Subscriber C received message: Morning news.
Subscriber A received message: Noon news.
Subscriber B received message: Noon news.
Subscriber C received message: Noon news.
Subscriber A received message: Evening news.
Subscriber B received message: Evening news.
Subscriber C received message: Evening news.
User B unsubscribed
Subscriber A received message: Late night news
Subscriber C received message: Late night news
```

