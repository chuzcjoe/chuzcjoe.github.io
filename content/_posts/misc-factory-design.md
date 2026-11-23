---
title: Factory Method vs Abstract Factory
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/me.jpeg
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
date: 2025-02-18 23:14:25
tags: [design pattern]
categories:
- misc
---

Both belong to creational design pattern.

<!-- more -->

# 1. Introduction

`Factory Method` is a creational design pattern that provides an interface for creating objects in a superclass, but allows subclasses to alter the type of objects that will be created.

`Abstract Factory` is a creational design pattern that lets you produce families of related objects without specifying their concrete classes.

Here is a greate analogy to understand the difference:

Imagine you are running a factory that produces paintings.

- **Factory Method: "One Artist, One Painting Style"**
  - You have different artists (subclasses), and each artist specializes in one type of painting (product).
  - The base class provides a method createPainting(), and each artist (subclass) decides what kind of painting they create.
  - Example:
    - A Landscape Artist creates landscape paintings.
    - A Portrait Artist creates portrait paintings.
    - If you add a Modern Artist, they create modern paintings.
Key Idea: The factory method lets subclasses decide which single product to create.

- **Abstract Factory: "A Complete Art Studio"**
  - Now, instead of just one type of painting, you need to provide a full art experience—paintings, frames, and brushes.
  - You create a factory for each style of art, and each factory produces a family of related products.
  - Example:
    - A Landscape Art Studio produces:
      - Landscape Paintings
      - Wooden Frames
      - Oil Brushes
    - A Modern Art Studio produces:
      - Abstract Paintings
      - Metal Frames
      - Acrylic Brushes
Key Idea: The abstract factory ensures that related products are created together.

# 2. Examples

Factory method.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/factory-design/factory_method.png
    " title="A regular image" width="800px" height="600px">
</p>

```cpp factory_method.cpp
#include <iostream>
#include <iostream>
#include <memory>
#include <string>

// Factory method
// product
class VideoDecoder {
public:
    virtual void decode(const std::string& file_name) = 0;
    virtual ~VideoDecoder()= default;
};

// concrete product1
class H264Decoder : public VideoDecoder{
public:
    virtual void decode(const std::string& file_name) override {
        std::cout << "H264Decoder decode: " << file_name + '\n';
    }
};

// concrete product2
class VP9Decoder : public VideoDecoder{
public:
    virtual void decode(const std::string& file_name) override {
        std::cout << "VP9Decoder decode: " << file_name + '\n';
    }
};

// creator
class DecoderFactory {
public:
    virtual std::unique_ptr<VideoDecoder> createDecoder() = 0;
    virtual ~DecoderFactory() = default;
};

// concrete creator
class H264DecoderFactory : public DecoderFactory {
public:
    virtual std::unique_ptr<VideoDecoder> createDecoder() override {
        return std::make_unique<H264Decoder>();
    }
};

// concrete creator
class VP9DecoderFactory : public DecoderFactory {
public:
    virtual std::unique_ptr<VideoDecoder> createDecoder() override {
        return std::make_unique<VP9Decoder>();
    }
};

void playVideo(DecoderFactory* factory, const std::string& file) {
    auto decoder = factory->createDecoder();
    decoder->decode(file);
}

int main() {
    // client code
    H264DecoderFactory h264;
    VP9DecoderFactory vp9;

    playVideo(&h264, "video1.mp4");
    playVideo(&h264, "video2.mp4");
    playVideo(&vp9, "video3.mp4");
    playVideo(&vp9, "video4.mp4");
}
```

Abstract factory.
<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/factory-design/abstract_factory.png
    " title="A regular image" width="800px" height="600px">
</p>

```cpp abstract_factory.cpp
#include <iostream>
#include <memory>

// Abstract Product A: Button
class Button {
public:
    virtual void render() = 0;
    virtual ~Button() = default;
};

// Abstract Product B: Checkbox
class Checkbox {
public:
    virtual void render() = 0;
    virtual ~Checkbox() = default;
};

// Concrete Products for Windows
class WindowsButton : public Button {
public:
    void render() override {
        std::cout << "Rendering Windows-style Button\n";
    }
};

class WindowsCheckbox : public Checkbox {
public:
    void render() override {
        std::cout << "Rendering Windows-style Checkbox\n";
    }
};

// Concrete Products for Mac
class MacButton : public Button {
public:
    void render() override {
        std::cout << "Rendering Mac-style Button\n";
    }
};

class MacCheckbox : public Checkbox {
public:
    void render() override {
        std::cout << "Rendering Mac-style Checkbox\n";
    }
};

// Abstract Factory Interface
class UIFactory {
public:
    virtual std::unique_ptr<Button> createButton() = 0;
    virtual std::unique_ptr<Checkbox> createCheckbox() = 0;
    virtual ~UIFactory() = default;
};

// Concrete Factory for Windows
class WindowsUIFactory : public UIFactory {
public:
    std::unique_ptr<Button> createButton() override {
        return std::make_unique<WindowsButton>();
    }
    std::unique_ptr<Checkbox> createCheckbox() override {
        return std::make_unique<WindowsCheckbox>();
    }
};

// Concrete Factory for Mac
class MacUIFactory : public UIFactory {
public:
    std::unique_ptr<Button> createButton() override {
        return std::make_unique<MacButton>();
    }
    std::unique_ptr<Checkbox> createCheckbox() override {
        return std::make_unique<MacCheckbox>();
    }
};

// Client Code
void buildUI(UIFactory& factory) {
    auto button = factory.createButton();
    auto checkbox = factory.createCheckbox();
    button->render();
    checkbox->render();
}

int main() {
    WindowsUIFactory windowsFactory;
    MacUIFactory macFactory;

    std::cout << "Windows UI:\n";
    buildUI(windowsFactory);
    

    std::cout << "\nMac UI:\n";
    buildUI(macFactory);

    return 0;
}
```