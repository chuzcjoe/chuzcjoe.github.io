---
title: Numeric Data Representation in Modern Computer System
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
date: 2024-07-01 23:03:06
tags: [numeric data]
categories:
- misc
---

Integer, fix-point number, floating-point number

<!-- more -->

This is a summary of MIT6.5940, lecture 5, data types part.

# 1. Integer

## 1.1 Unsigned Integer

For an N-bit unsigned integer, its range is $[0, 2^N - 1]$

<p align="center">
    <img src="unsignedinteger.png" title="A regular image" width="350" height="300px">
</p>

## 1.2 Signed Integer

### 1.2.1 Sign-Magnitude Representation

For N-bit, the most left(highest) bit is a sign bit. Its range is $[-(2^{n-1}-1), 2^{n-1}-1]$

There are two ways to represent 0
- 10000000
- 00000000

<p align="center">
    <img src="signedinteger1.png" title="A regular image" width="350" height="300px">
</p>

### 1.2.2 Two’s Complement Representation

**sign bit**
- Most significant bit (MSB) is the sign bit.
- if MSB is 0, the number is positive or zero.
- if MSB is 1, the number is negative.

**range(for N-bit)**
- The min is where MSB is 1 and the rest is 0, which is $-2^{n-1}$.
- The max is where MSB is 0 and the rest is 1, which is $2^{n-1}-1$.

Two's complement has only one representation for zero: 00000000.

<p align="center">
    <img src="twocomplement.png" title="A regular image" width="350" height="300px">
</p>

Steps to obtain Two's complement:

Positive Numbers:
  - Represent the number in binary as usual.

Negative Numbers:
  - Start with the binary representation of the absolute value.
  - Invert all the bits (change 0s to 1s and 1s to 0s).
  - Add 1 to the least significant bit (LSB).

For example:

**Positive Number (e.g., +5):**
1. Convert +5 to binary: 0101
2. The result is 0101, which is the binary representation in two's complement.

**Negative Number (e.g., -5):**
1. Convert 5 to binary: 0101
2. Invert the bits: 1010
3. Add 1: 1010 + 1 = 1011
4. The result is 1011, which is the binary representation of -5 in two's complement.

Two's complement makes the arithmetic simpler and hardware implementation friendly.
```
Addition of 4-bit Two's complement numbers

3+(-5)

3 is "0011"
5 is "1011"

  0011
+ 1011
------
  1110

"1110" is -2 in Two's complement representation.
```

# 2. Fixed-Point Number

<p align="center">
    <img src="fixedpoint.png" title="A regular image" width="500" height="300px">
</p>
<p align="center">
<em>source: https://www.dropbox.com/scl/fi/eos92o2fgys6gk0gizogl/lec05.pdf?rlkey=2hohvi8jcvjw3f8m8vugfa2mz&e=1&dl=0</em>
</p>

Example with negative numbers.
```
-5.5

In 8 bit representation, one possible representation could be 0101.1000
Invert bits: 1010.0111
Add 1 to the LSB: 1010.0111 + 0.0001 = 1010.1000

1010.1000 -> 1x(-2^(3)) + 1x2^(1) + 1x2^(-1) = -8 + 2 + 0.5 = -5.5
```

# 3. Floating-Point Number

## 3.1 32-bit floating point number

<p align="center">
    <img src="32bitfloatingpoint.png" title="A regular image" width="500" height="300px">
</p>

The number it can represent:
$$
(-1)^{sign} \times (1 + mantissa) \times 2^{exponent-127}
$$

**Q: How can we represent zero in 32-bit floating point number?**

The equation above only applies to cases where `exponent` is not all zeros. If `exponent` is all zeros, then it follows another equation.
$$
(-1)^{sign} \times mantissa \times 2^{1-127}
$$
So, we have two ways to represent zero, where we let `mantissa` part to be `0`.
<p align="center">
    <img src="32bitfloatingpointzero.png" title="A regular image" width="500" height="300px">
</p>

## 3.2 Half Precision (FP16)

<p align="center">
    <img src="fp16.png" title="A regular image" width="500" height="300px">
</p>

$$
(-1)^{sign} \times (1 + mantissa) \times 2^{exponent-15}
$$

# 4. INT4

<p align="center">
    <img src="int4.png" title="A regular image" width="200" height="200px">
</p>

Negative numbers are represented using Two's complement.

 Binary | Decimal 

 0000  ->  0       
 0001  ->  1       
 0010  ->  2       
 0011  ->  3       
 0100  ->  4       
 0101  ->  5       
 0110  ->  6       
 0111  ->  7       
 1000  ->  -8      
 1001  ->  -7      
 1010  ->  -6      
 1011  ->  -5      
 1100  ->  -4      
 1101  ->  -3      
 1110  ->  -2      
 1111  ->  -1      

# 5. FP4

<p align="center">
    <img src="fp4.png" title="A regular image" width="500" height="200px">
</p>

# References

- https://www.dropbox.com/scl/fi/eos92o2fgys6gk0gizogl/lec05.pdf?rlkey=2hohvi8jcvjw3f8m8vugfa2mz&e=1&dl=0