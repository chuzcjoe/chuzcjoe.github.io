---
title: Bitfields
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/site/baby.png
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
date: 2025-05-16 10:48:05
tags: [bitfields]
categories:
- cpp
---

Intoducing bitfileds in C++

<!-- more -->

# Table of Contents

- <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> Introduction </span>
- <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> Caveats </span>
- <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> Example </span>

# 1. Introduction

In C++, bitfields are a feature that allows you to specify the exact number of bits a data member in a structure (or class) should occupy, rather than using a full byte or more as standard data types do. This is useful for memory optimization, especially in embedded systems, low-level programming, or when dealing with hardware registers, network protocols, or packed data structures where you need precise control over memory usage.

**What Are Bitfields?**

A bitfield is a member of a struct or class declared with a specified number of bits using the `: <number>` syntax. Bitfields are typically used with integral types (like `int`, `unsigned int`, or `bool`) and allow you to pack multiple fields into fewer bytes by allocating only the exact number of bits needed.

```cpp
struct Flags {
    unsigned short isActive : 1;    // 1 bit (0 or 1)
    unsigned short mode : 2;       // 2 bits (0 to 3)
    unsigned short priority : 3;   // 3 bits (0 to 7)
    unsigned short reserved : 2;   // 2 bits (unused)
};

int main() {
    Flags flags;
    flags.isActive = 1;   // Set to true (1)
    flags.mode = 2;       // Set to 2
    flags.priority = 5;   // Set to 5
    flags.reserved = 0;   // Set to 0

    std::cout << "Size of Flags: " << sizeof(Flags) << " bytes\n";
    std::cout << "isActive: " << flags.isActive << "\n";
    std::cout << "mode: " << flags.mode << "\n";
    std::cout << "priority: " << flags.priority << "\n";

    return 0;
}
```

```
Size of Flags: 2 bytes
isActive: 1
mode: 2
priority: 5
```

Bitfields can only be declared as `Integral Types` Only. Other types such as `float` are not allowed. The total size of a struct(or class) with bitfields is usually the underlying type(e.g., 32 bits for an unsigned int) if the the number of bits used doesn't exceed the bit limit.

When there’s not enough space left in the current allocation unit (like a 16-bit short), the compiler will start a new one, leading to increase size of a struct/class.

```cpp
struct Flags {
    unsigned short isActive : 1;    // 1 bit (0 or 1)
    unsigned short mode : 2;       // 2 bits (0 to 3)
    unsigned short priority : 3;   // 3 bits (0 to 7)
    unsigned short reserved : 2;   // 2 bits (unused)
    unsigned short rest : 11;
}; // 4 bytes
```

# 2. Caveats

## 2.1 Implementation-Defined Layout

The layout of bitfields (e.g., bit ordering, padding, and alignment) is compiler- and platform-dependent. Different compilers or architectures (e.g., big-endian vs. little-endian) may arrange bits differently, making bitfields non-portable.

## 2.2 No Type Safety or Overflow Protection

Assigning a value larger than the bitfield silently truncates the value.

```cpp
struct Flags {
    unsigned short isActive : 1;    // 1 bit (0 or 1)
    unsigned short mode : 3;       // 3 bits (0 to 7)
    unsigned short priority : 3;   // 3 bits (0 to 7)
    unsigned short reserved : 2;   // 2 bits (unused)
};

Flags flags;
flags.mode = 10;       // will be truncated to 2
```

If we set `mode` to be `10` by mistake, which exceeds the representation limit of 3 bits. The compiler silently truncates the value to be `0b1010 & 0b0111 = 0b0010  (which is 2)`

## 2.3 Unspecified Signedness of Plain int Bitfields

```cpp
struct S {
    int x : 3;
};
```
The signedness (signed vs. unsigned) of `x` is implementation-defined.

**Tip**: Always use `signed int` and `unsigned int` explicitly for clarity.

## 2.4 Compiler Behavior

- Compilers may insert padding between bitfields or at the end of a struct to align data to word boundaries, increasing memory usage unexpectedly.
- Adjacent bitfields may not always be packed tightly; the compiler decides based on the underlying type and alignment rules.
- Accessing bitfields often requires the compiler to generate additional instructions for masking and shifting, which can be slower than accessing regular variables.
- The C++ standard leaves many aspects of bitfields (e.g., allocation order, padding) up to the implementation, so code relying on specific behavior may break when compiled with a different compiler or on a different platform.

# 3. Example

**Real-World Example: IPv4 Header with Bitfields**

The IPv4 header is a 20-byte (160-bit) structure (without options) that precedes the payload in an IP packet. It contains fields like version, header length, type of service, total length, identification, flags, fragment offset, time to live, protocol, header checksum, source address, and destination address. Many of these fields are smaller than a byte, making bitfields perfect for mapping them.

```cpp
struct IPv4Header {
    uint8_t version : 4;        // 4 bits: IP version (4 for IPv4)
    uint8_t ihl : 4;            // 4 bits: Internet Header Length
    uint8_t typeOfService;      // 8 bits: Type of Service
    uint16_t totalLength;       // 16 bits: Total packet length
    uint16_t identification;    // 16 bits: Packet identifier
    uint8_t flags : 3;          // 3 bits: Fragmentation flags
    uint16_t fragmentOffset : 13; // 13 bits: Fragment offset
    uint8_t timeToLive;         // 8 bits: Time to Live
    uint8_t protocol;           // 8 bits: Protocol (e.g., 6 for TCP)
    uint16_t headerChecksum;    // 16 bits: Header checksum
    uint32_t sourceAddress;     // 32 bits: Source IP address
    uint32_t destinationAddress; // 32 bits: Destination IP address
};
```

The total size is `1 + 1 + 2 + 2 + 2 + 1 + 1 + 2 + 4 + 4 = 20 bytes`.

