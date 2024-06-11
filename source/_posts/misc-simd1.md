---
title: SIMD - 01
author: Joe Chu
date: 2024-06-09 00:13:26
tags: [simd]
categories:
- misc
---

SIMD introduction.

<!-- more -->

# 1. Introduction

Single Instruction, Multiple Data (SIMD) is a parallel computing architecture that enhances the performance of processors by allowing them to execute a single instruction on multiple pieces of data simultaneously. SIMD is particularly effective for applications that perform the same operation on large data sets, such as multimedia processing, scientific computing, and machine learning.

**Common SIMD Instruction Sets**

- SSE (Streaming SIMD Extensions):
    - Developed by Intel for x86 processors.
    - Introduced in 1999, SSE provides instructions for parallel processing of floating-point and integer data.

- AVX (Advanced Vector Extensions):
    - Also developed by Intel, AVX is an advanced SIMD extension for x86 processors.
    - AVX extends the capabilities of SSE with wider vector registers (256 bits in AVX, 512 bits in AVX-512) and additional instructions.

- ARM NEON:
    - Developed for ARM architecture, NEON is a 128-bit SIMD extension.
    - Widely used in mobile and embedded devices for multimedia processing and other compute-intensive tasks.

- AltiVec (also known as VMX):
    - Developed for PowerPC processors, AltiVec is a 128-bit SIMD extension used for high-performance computing and multimedia applications.

- SVE (Scalable Vector Extension):
    - Developed by ARM for high-performance and scientific computing.
    - SVE supports variable vector lengths, providing flexibility and scalability.

- RISC-V Vector Extension:
    - An open-source SIMD extension for the RISC-V architecture.
    - Supports variable-length vector operations, similar to ARM's SVE.

# 2. ARM Neon

ARM Neon is widely used in mobile devices, embedded systems, and increasingly in general-purpose computing platforms like Apple's M1 and subsequent chips. ARM NEON is crucial for mobile computing as it provides significant performance improvements, energy efficiency, and enhanced capabilities for multimedia, gaming, machine learning, and real-time processing applications. Its ability to process multiple data elements in parallel makes it an essential feature for modern mobile devices, ensuring a responsive, efficient, and high-quality user experience.

# 2.1 ARMv8 Neon Register

ARMv8 is a 64-bit based architecture and was introduced in 2011. It applies to most of the modern smartphones, embeded devices. In addition, its higher bit capacity makes it suitable for high performance computing.

<p align="center">
    <img src="armv8.png" title="A regular image" width="800px" height="500px">
</p>

ARMv8 architecture provides `32` NEON registers, named V0 to V31. Each NEON register is `128` bits wide.

As the figure shown above, the 128-bit NEON registers can be accessed as sub-registers for different data types and vector lengths. This allows efficient packing of data for SIMD operations.

- One 128-bit quadword (Q)   `Q0-A31`
- Two 64-bit doublewords (D) `D0-D31`
- Four 32-bit words (S)      `S0-S31`
- Eight 16-bit halfwords (H) `H0-H31`
- Sixteen 8-bit bytes (B)    `B0-B31`

# 2.2 Lanes and Load

In ARM NEON, lanes refer to the individual elements within a vector register. Each vector register (V0-V31) is 128 bits wide and can be divided into lanes, depending on the data type:

- 16 lanes of 8-bit integers
- 8 lanes of 16-bit integers
- 4 lanes of 32-bit integers or single-precision floating-point numbers
- 2 lanes of 64-bit integers or double-precision floating-point numbers

<p align="center">
    <img src="lanes.png" title="A regular image" width="800px" height="500px">
</p>

```cpp
int32x4_t vec = vdupq_n_s32(0);

// Load data[0] into lane 0 of vec
vec = vld1q_lane_s32(&data[0], vec, 0);

// Load data[1] into lane 1 of vec
vec = vld1q_lane_s32(&data[1], vec, 1);

// Load data[2] into lane 2 of vec
vec = vld1q_lane_s32(&data[2], vec, 2);

// Load data[3] into lane 3 of vec
vec = vld1q_lane_s32(&data[3], vec, 3);

// Now vec contains: [data[0], data[1], data[2], data[3]]
```

# 3. Conclusion

Understanding these core concepts is essential for comprehending parallelism in ARM Neon and writing efficient code. We'll continue to delve further into more aspects of ARM Neon intrinsics.

# References

- https://eclecticlight.co/2021/08/23/code-in-arm-assembly-lanes-and-loads-in-neon/