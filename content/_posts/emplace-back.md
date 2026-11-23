---
title: push_back() vs emplace_back()
author: Joe Chu
date: 2023-11-06 17:18:21
tags: [cpp]
categories:
- cpp
---

why we use emplace_back()? When should we use emplace_back()?

<!-- more -->

**Let's first define our class**

```cpp
class Base {
public:
    Base(int id, const string& name) : m_id(id), m_name(name) {
        cout << "Base(int, string&)\n";
    }
    
    Base(const Base& obj): m_id(obj.m_id), m_name(obj.m_name) {
        cout << "Base(const Base&)\n";
    }
    
    Base(Base&& obj) : m_id(obj.m_id), m_name(move(obj.m_name)) {
        cout << "Base(Base&&)\n";
    }
    
    ~Base() {
        cout << "~Base()\n";
    }

private:
    int m_id;
    string m_name;
};
```

**Let's take a look at example 1**
Call basic constructor.
```cpp
int main() {
    Base b1(0, "Joe");
    
    cout << "---------push_back()\n";
    vector<Base> vec1;
    vec1.push_back(b1); // Base(const Base&)
    
    cout << "---------emplace_back()\n";
    vector<Base> vec2;
    vec2.emplace_back(b1); // Base(const Base&)
    
    cout << "---------finish\n";
    
    return 0;
}
```

**example 2**
Use std::move() semantic to make Base objects rvalues.
```cpp
int main() {
    Base b1(0, "Joe");
    Base b2(0, "Jack");
    
    cout << "---------push_back()\n";
    vector<Base> vec1;
    vec1.push_back(move(b1)); // Base(Base&&)
    
    cout << "---------emplace_back()\n";
    vector<Base> vec2;
    vec2.emplace_back(move(b2)); // Base(Base&&)
    
    cout << "---------finish\n";
    
    return 0;
}
```

**example 3**
Create class objects in-place.
```cpp
int main() {    
    cout << "---------push_back()\n";
    vector<Base> vec1;
    vec1.push_back(Base(0, "Joe")); // Base(int, string&)  Base(Base&&)  ~Base()
    
    cout << "---------emplace_back()\n";
    vector<Base> vec2;
    vec2.emplace_back(Base(1, "Jack")); // Base(int, string&)  Base(Base&&)  ~Base()
    
    cout << "---------finish\n";
    
    return 0;
}
```

Explain: Base(0, "Joe") creates a temporary class instance. After it is being used, it get deleted.

**example 5**
Emplace_back() creates an object instance directly on the stack. Skip the temporary creation.
```cpp
int main() {    
    cout << "---------push_back()\n";
    vector<Base> vec1;
    vec1.push_back(Base(0, "Joe")); // Base(int, string&)  Base(Base&&)  ~Base()
    
    cout << "---------emplace_back()\n";
    vector<Base> vec2;
    vec2.emplace_back(1, "Jack"); // Base(int, string&)
    
    cout << "---------finish\n";
    
    return 0;
}
```

**Conclusion**
In the majority of cases, they are interchangeable. However, emplace_back() is more efficient when constructing objects directly within the container.