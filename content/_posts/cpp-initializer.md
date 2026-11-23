---
title: Initializer
author: Joe Chu
date: 2024-05-27 14:58:04
tags: [initializer]
categories:
- cpp
---

(), {} and std::initializer_list

<!-- more -->

# 1. Commons and distinctions between () and {}
<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
  overflow:hidden;padding:10px 5px;word-break:normal;}
.tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
  font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg .tg-9wq8{border-color:inherit;text-align:center;vertical-align:middle}
</style>
<table class="tg"><thead>
  <tr>
    <th class="tg-9wq8" colspan="2"></th>
    <th class="tg-9wq8">()</th>
    <th class="tg-9wq8">{}</th>
  </tr></thead>
<tbody>
  <tr>
    <td class="tg-9wq8" colspan="2">Commons</td>
    <td class="tg-9wq8" colspan="2">
    Direct initialization
    <pre><code>
    int x(3);
    int x{3};
    std::string name("Some Name");
    std::string name{"Some Name"};
    int* y = new int(1);
    int* y = new int{1};
    </code></pre><br>
    Call constructors
    <pre><code>
    MyClass mc(1);
    MyClass mc{1}; // If no initializer list constructor exists.
    </code></pre>
    </td>
  </tr>
  <tr>
    <td class="tg-9wq8" rowspan="2">Distincetions</td>
    <td class="tg-9wq8">Narrowing Conversions</td>
    <td class="tg-9wq8"><pre><code>int pi(3.14);  // OK -- pi == 3.</code></pre></td>
    <td class="tg-9wq8"><pre><code>int pi{3.14};  // Compile error: narrowing conversion.</code></pre></td>
  </tr>
  <tr>
    <td class="tg-9wq8">Uniform Initialization</td>
    <td class="tg-9wq8"><pre><code>std::vector<int> v(100, 1);  // A vector containing 100 items: All 1s.</code></pre></td>
    <td class="tg-9wq8"><pre><code>std::vector<int> v{100, 1};  // A vector containing 2 items: 100 and 1.</code></pre></td>
  </tr>
</tbody>
</table>

# 2. std:: initializer_list

Using `std::initializer_list` allows a class to be constructed with a list of values, providing flexibility and ease of initialization.

```c++
template<typename T>
struct S {
    S(std::initializer_list<T> data) : _data(data) {
        std::cout << "initializer_list contructor called\n";
    }
    S(T a, T b, T c) {
        std::cout << "3 params contructor called\n";
    }
private:
    std::initializer_list<T> _data;
};

int main() {
    S<int> s1{1, 2, 3}; // Ok, initializer_list contructor called.
    S<int> s2(1, 2, 3); // Ok, 3 params contructor called.
    S<int> s3{1.1, 2.2, 3.3}; // Error, narrowing conversion.
    return 0;
}
```

`{}` provides a more safer way(prevent type conversion) for initialization. In situations where `{}` and `()` are equivalent, we should choose `{}` over `()`;

# References

- https://google.github.io/styleguide/cppguide.html#Variable_and_Array_Initialization
- https://en.cppreference.com/w/cpp/utility/initializer_list