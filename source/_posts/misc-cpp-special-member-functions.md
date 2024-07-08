---
title: Summary of Special Member Functions In C++
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
date: 2024-07-04 00:53:01
tags: [special member functions]
categories:
- cpp
---

One example to demonstrate the usage of all C++ special member functions.

<!-- more -->

This is still a pretty popular topic that you will be given during coding interview. 

1. Default Constructor: ClassName() = default;
2. Destructor: ~ClassName() = default;
3. Copy Constructor: ClassName(const ClassName&) = default;
4. Copy Assignment Operator: ClassName& operator=(const ClassName&) = default;
5. Move Constructor: ClassName(ClassName&&) = default;
6. Move Assignment Operator: ClassName& operator=(ClassName&&) = default;

```cpp
#include <iostream>

class Shape {
public:
    Shape(size_t size = 0) 
        : size_(size), data_(size ? new int[size] : nullptr) {
        std::cout << "Shape constructed with size " << size_ << "\n";
        if (data_) {
            for (size_t i = 0; i < size_; ++i) {
                data_[i] = 0; // Initialize data
            }
        }
    }

    virtual ~Shape() {
        delete[] data_;
        std::cout << "Shape destructed\n";
    }

    Shape(const Shape& other) 
        : size_(other.size_), data_(other.size_ ? new int[other.size_] : nullptr) {
        if (data_) {
            for (size_t i = 0; i < size_; ++i) {
                data_[i] = other.data_[i];
            }
        }
        std::cout << "Shape copy-constructed\n";
    }

    Shape(Shape&& other) noexcept 
        : size_(other.size_), data_(other.data_) {
        other.size_ = 0;
        other.data_ = nullptr;
        std::cout << "Shape move-constructed\n";
    }

    Shape& operator=(const Shape& other) {
        if (this != &other) {
            delete[] data_;
            size_ = other.size_;
            data_ = other.size_ ? new int[other.size_] : nullptr;
            if (data_) {
                for (size_t i = 0; i < size_; ++i) {
                    data_[i] = other.data_[i];
                }
            }
        }
        std::cout << "Shape copy-assigned\n";
        return *this;
    }

    Shape& operator=(Shape&& other) noexcept {
        if (this != &other) {
            delete[] data_;
            size_ = other.size_;
            data_ = other.data_;
            other.size_ = 0;
            other.data_ = nullptr;
        }
        std::cout << "Shape move-assigned\n";
        return *this;
    }

    virtual void describe() const = 0;

protected:
    size_t size_;
    int* data_;
};

class Rectangle : public Shape {
public:
    Rectangle(size_t width = 0, size_t height = 0)
        : Shape(width * height), _width(width), _height(height) {
        std::cout << "Rectangle constructed with width " << _width 
                  << " and height " << _height << "\n";
    }

    Rectangle(const Rectangle& other)
        : Shape(other), _width(other._width), _height(other._height) {
        std::cout << "Rectangle copy-constructed\n";
    }

    Rectangle(Rectangle&& other) noexcept
        : Shape(std::move(other)), _width(other._width), _height(other._height) {
        other._width = 0;
        other._height = 0;
        std::cout << "Rectangle move-constructed\n";
    }

    Rectangle& operator=(const Rectangle& other) {
        if (this != &other) {
            Shape::operator=(other);
            _width = other._width;
            _height = other._height;
        }
        std::cout << "Rectangle copy-assigned\n";
        return *this;
    }

    Rectangle& operator=(Rectangle&& other) noexcept {
        if (this != &other) {
            Shape::operator=(std::move(other));
            _width = other._width;
            _height = other._height;
            other._width = 0;
            other._height = 0;
        }
        std::cout << "Rectangle move-assigned\n";
        return *this;
    }

    ~Rectangle() override {
        std::cout << "Rectangle destructed\n";
    }

    void describe() const override {
        std::cout << "Rectangle with width " << _width 
                  << " and height " << _height << "\n";
    }

private:
    size_t _width;
    size_t _height;
};

int main() {
    std::cout << "Creating rect1\n";
    Rectangle rect1(3, 2); // Outputs: Shape constructed, Rectangle constructed

    std::cout << "\nCopy constructing rect2 from rect1\n";
    Rectangle rect2(rect1); // Outputs: Shape copy-constructed, Rectangle copy-constructed

    std::cout << "\nMove constructing rect3 from rect1\n";
    Rectangle rect3(std::move(rect1)); // Outputs: Shape move-constructed, Rectangle move-constructed

    std::cout << "\nCopy assigning rect2 to rect3\n";
    rect2 = rect3; // Outputs: Shape copy-assigned, Rectangle copy-assigned

    std::cout << "\nMove assigning rect3 to rect2\n";
    rect3 = std::move(rect2); // Outputs: Shape move-assigned, Rectangle move-assigned

    std::cout << "\nDescribing rect3\n";
    rect3.describe(); // Outputs: Rectangle with width 3 and height 2

    std::cout << "\nEnd of main, destroying objects\n";
    // Outputs: Rectangle destructed, Shape destructed for each object

    return 0;
}
```

```
Creating rect1
Shape constructed with size 6
Rectangle constructed with width 3 and height 2

Copy constructing rect2 from rect1
Shape copy-constructed
Rectangle copy-constructed

Move constructing rect3 from rect1
Shape move-constructed
Rectangle move-constructed

Copy assigning rect2 to rect3
Shape copy-assigned
Rectangle copy-assigned

Move assigning rect3 to rect2
Shape move-assigned
Rectangle move-assigned

Describing rect3
Rectangle with width 3 and height 2

End of main, destroying objects
Rectangle destructed
Shape destructed
Rectangle destructed
Shape destructed
Rectangle destructed
Shape destructed
```