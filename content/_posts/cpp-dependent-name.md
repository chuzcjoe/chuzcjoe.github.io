---
title: C++ Dependent Name
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
    index: null
    collapsed: true
    depth: 3
  - position: left
    type: adsense
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2025-02-27 22:07:43
tags: [template]
categories:
- cpp
---

In C++, a dependent name refers to a name (e.g., a type, variable, function, or template) whose meaning depends on a template parameter.

<!-- more -->

This concept arises in the context of templates, where the compiler cannot fully resolve certain names until the template is instantiated with specific types or values.

# 1. Introduction

When the compiler processes a template definition, it performs a two-phase lookup:

1. Non-dependent names: Resolved at the point of template definition (when the template is written).
2. Dependent names: Resolved at the point of template instantiation (when the template is used with concrete types).

Because dependent names rely on template parameters, the compiler delays their resolution until it knows the actual types involved. This introduces some special rules and syntax, like the `typename` and `template` keywords, to help the compiler distinguish between types and non-types or to access nested template members.

# 2. An all-in-one example

```cpp
#include <iostream>

// A helper struct with various dependent elements
struct MyStruct {
    using value_type = int; // Dependent type

    static double scale; // Dependent variable

    void process() { // Dependent function
        std::cout << "Processing in MyStruct\n";
    }

    // Templated member function with a return value
    template <typename U>
    U transform(U value) {
        std::cout << "Transforming: " << value << "\n";
        return value * 2;
    }
};

// Define the static variable
double MyStruct::scale = 2.5;

// A template class that uses dependent names
template <typename T>
class Worker {
public:
    void run(T obj, float input) {
        // 1. Dependent Type
        typename T::value_type result = 10;

        // 2. Dependent Variable
        double scaled = input * T::scale;

        // 3. Dependent Function Call
        obj.process();

        // 4. Dependent Function Template with Return Value
        float transformed = obj.template transform<float>(scaled); // Capture return value

        std::cout << "Result: " << result << ", Scaled: " << scaled 
                  << ", Transformed: " << transformed << "\n";
    }
};

int main() {
    MyStruct s;
    Worker<MyStruct> w;
    w.run(s, 4.0f);
    return 0;
}
```