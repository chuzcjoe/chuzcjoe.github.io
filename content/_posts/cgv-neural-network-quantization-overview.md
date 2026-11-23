---
title: Post-Training Data-Free Weight Quantization
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
date: 2026-05-25 13:47:50
tags: [neural network, quantization]
categories:
- CGV
---

Post-Training Data-Free Weight Quantization (RTN)

<!-- more -->

# Table of Contents

> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 1. Introduction to Quantization </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 2. Quantization Basics: The Scalar Form </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 3. Symmetric vs. Asymmetric </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 4. Post-Training Data-Free Weight Quantization (RTN) </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 5. Matrix Form of Quantization </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 6. Applying Quantization in Network Inference </span>
> <span style="color:#1E90FF; font-size:18px; font-weight:bold;"> 7. Quantization Error </span>

# 1. Introduction to Quantization

A trained neural network is a huge pile of numbers — mostly **weights** — usually stored as 32-bit floating point (`FP32`). That is 4 bytes per number, and inference multiplies and adds them billions of times.

**Quantization** maps these high-precision real numbers onto a small set of integers, most often 8-bit (`INT8`). The benefits are direct:

- **Smaller**: `INT8` is 1 byte instead of 4, so the model shrinks about $4\times$.
- **Faster**: moving fewer bytes and doing integer math speeds up inference.
- **Cheaper**: integer hardware uses less power and silicon than floating-point hardware.

The price is a small rounding error. The whole job of quantization is to keep that error tiny while reaping the savings.

The core idea is a simple **affine** (straight-line) relationship between a real number $r$ and an integer $q$:

$$
\begin{equation}
r \approx s \cdot (q - z)
\end{equation}
$$

Here $s$ (the **scale**) and $z$ (the **zero-point**) are two numbers we choose per tensor. Everything in this post — scalars, matrices, full network layers — is built on this one equation. Let's start with a single number.

# 2. Quantization Basics: The Scalar Form

Take one real number $r$ and store it as a $b$-bit integer $q$. Three quantities define the mapping:

- $s$ — the **scale**: the real-world size of one integer step (a positive float).
- $z$ — the **zero-point**: the integer that maps exactly to real $0$.
- $q$ — the stored **integer**.

**Integer range.** A $b$-bit format can only hold integers in a fixed window $[q_{min}, q_{max}]$:

$$
\begin{equation}
\text{signed: } [-2^{b-1},\ 2^{b-1} - 1] \\\\
\text{unsigned: } [0,\ 2^{b} - 1]
\end{equation}
$$

For `INT8` that is $[-128, 127]$ (signed) or $[0, 255]$ (unsigned).

**Choosing the scale and zero-point.** Suppose the real numbers we care about lie in $[r_{min}, r_{max}]$. We line that interval up with the integer window by matching the two endpoints: $r_{min}$ maps to $q_{min}$ and $r_{max}$ maps to $q_{max}$. That fixes both parameters:

$$
\begin{equation}
s = \frac{r_{max} - r_{min}}{q_{max} - q_{min}}
\end{equation}
$$

$$
\begin{equation}
z = \text{round}\left(q_{min} - \frac{r_{min}}{s}\right)
\end{equation}
$$

The scale is "real range divided by integer range". The zero-point is the integer that real $0$ falls on, rounded so it stays a whole number.

**Quantize (real $\rightarrow$ integer).** Invert the affine map, round to the nearest integer, and clamp into the valid window:

$$
\begin{equation}
q = \text{clamp}\left(\text{round}\left(\frac{r}{s}\right) + z,\ q_{min},\ q_{max}\right)
\end{equation}
$$

where the helpers are:

$$
\begin{equation}
\text{round}(x) = \text{nearest integer to } x \\\\
\text{clamp}(x, a, b) = \min(\max(x, a), b)
\end{equation}
$$

**Dequantize (integer $\rightarrow$ real).** Apply the affine map to recover an approximation:

$$
\begin{equation}
\hat{r} = s \cdot (q - z)
\end{equation}
$$

The hat means $\hat r$ is a *reconstruction* of $r$, not the original — quantization is lossy.

**A quick example.** Map $[r_{min}, r_{max}] = [-1.0, 3.0]$ onto `uint8` ($q_{min}=0$, $q_{max}=255$):

$$
\begin{equation}
s = \frac{3.0 - (-1.0)}{255 - 0} = \frac{4}{255} \approx 0.0157 \\\\
z = \text{round}\left(0 - \frac{-1.0}{0.0157}\right) = \text{round}(63.75) = 64
\end{equation}
$$

To store $r = 1.3$:

$$
\begin{equation}
q = \text{clamp}(\text{round}(1.3 / 0.0157) + 64,\ 0,\ 255) = 147 \\\\
\hat{r} = 0.0157 \cdot (147 - 64) \approx 1.302
\end{equation}
$$

We recover $1.302$ instead of $1.3$ — an error of about $0.002$.

# 3. Symmetric vs. Asymmetric

The formulas above are **asymmetric** (or *affine*): the real range can be lopsided around zero, and the nonzero $z$ absorbs the offset. This suits one-sided data, like the output of a ReLU (always $\ge 0$).

For **weights**, which are usually centered on zero, we prefer **symmetric** quantization. We force $z = 0$ and pick a range symmetric about the origin. Let $r_{max}^{abs} = \max(|r_{min}|, |r_{max}|)$ be the largest magnitude. Then:

$$
\begin{equation}
z = 0 \\\\
s = \frac{r_{max}^{abs}}{2^{b-1} - 1}
\end{equation}
$$

We use $2^{b-1} - 1$ (i.e. $127$ for `INT8`) so the integer range is the balanced $[-127, 127]$. With $z = 0$, quantize and dequantize simplify to:

$$
\begin{equation}
q = \text{clamp}\left(\text{round}\left(\frac{r}{s}\right),\ -(2^{b-1}-1),\ 2^{b-1}-1\right) \\\\
\hat{r} = s \cdot q
\end{equation}
$$

No zero-point to track, and dequantization is a single multiply. The comparison:

| | Symmetric | Asymmetric |
|---|---|---|
| Zero-point $z$ | always $0$ | integer offset |
| Best for | weights (zero-centered) | activations (one-sided) |
| Dequant cost | one multiply | multiply + subtract |
| Range usage | wastes range if data is skewed | uses the full range |

The rest of this post uses **symmetric** quantization for weights, since that is what the basic algorithm below relies on.

# 4. Post-Training Data-Free Weight Quantization (RTN)

This is the simplest practical quantization algorithm. Each word tells you what it does:

- **Post-training** — applied to an already-trained model; no retraining.
- **Data-free** — uses only the weights; no calibration data is run through the network.
- **Weight** — quantizes weights only; activations stay in float.
- **RTN** — **round-to-nearest**: each weight snaps to its closest integer level.

It is the fastest method because weights are fixed numbers already sitting in the checkpoint — their range is known without any data. The recipe for one weight tensor:

> 1. Find the range: $r_{max}^{abs} = \max |W|$.
> 2. Compute the scale: $s = r_{max}^{abs} / (2^{b-1} - 1)$.
> 3. Quantize by RTN: $q = \text{clamp}(\text{round}(W / s),\ -127,\ 127)$.
> 4. Store the integers $q$ and the scale $s$.

That is the entire algorithm. The interesting math begins when $W$ is not a single number but a matrix — which is what the next section is about.

# 5. Matrix Form of Quantization

Real layers store weights as a matrix $W \in \mathbb{R}^{m \times n}$ ($m$ output channels, $n$ input features), with entries $W_{ij}$. We now write quantization in matrix form. The granularity — how many scales we use — is the key design choice.

## 5.1 Per-tensor quantization

The simplest scheme: **one scale for the whole matrix**. With symmetric `INT8`,

$$
\begin{equation}
s = \frac{\max_{i,j} |W_{ij}|}{2^{b-1} - 1}
\end{equation}
$$

Quantization and dequantization apply that one scalar to every entry:

$$
\begin{equation}
Q_{ij} = \text{clamp}\left(\text{round}\left(\frac{W_{ij}}{s}\right),\ -127,\ 127\right) \\\\
\hat W_{ij} = s \cdot Q_{ij}
\end{equation}
$$

In compact matrix notation, with $Q \in \mathbb{Z}^{m \times n}$ the integer matrix:

$$
\begin{equation}
Q = \text{clamp}\left(\text{round}\left(\frac{1}{s} W\right)\right), \qquad \hat{W} = s\, Q
\end{equation}
$$

One float ($s$) is shared across all $m \times n$ integers, so the storage overhead of the scale is negligible.

## 5.2 Per-channel quantization

One global scale is wasteful when rows differ in magnitude: a row with a large weight forces a large $s$, which crushes the precision of rows whose weights are all small. The fix is **one scale per output channel** (per row). For row $i$:

$$
\begin{equation}
s_i = \frac{\max_j |W_{ij}|}{2^{b-1} - 1}
\end{equation}
$$

$$
\begin{equation}
Q_{ij} = \text{clamp}\left(\text{round}\left(\frac{W_{ij}}{s_i}\right),\ -127,\ 127\right) \\\\
\hat W_{ij} = s_i \cdot Q_{ij}
\end{equation}
$$

Collect the per-row scales into a vector $\mathbf{s} = (s_1, \dots, s_m)$ and place them on the diagonal of a matrix:

$$
\begin{equation}
S = \text{diag}(s_1, s_2, \dots, s_m) = \begin{bmatrix} s_1 & 0 & \cdots & 0 \\\\ 0 & s_2 & \cdots & 0 \\\\ \vdots & \vdots & \ddots & \vdots \\\\ 0 & 0 & \cdots & s_m \end{bmatrix}
\end{equation}
$$

Then dequantization is a single clean matrix product:

$$
\begin{equation}
\hat W = S Q
\end{equation}
$$

Why does this work? Left-multiplying $Q$ by a diagonal matrix scales **each row** by its own factor. Reading off entry $(i,j)$ of $S Q$:

$$
\begin{equation}
SQ_{ij} = \sum_{k=1}^{m} S_{ik}Q_{kj} = s_iQ_{ij}
\end{equation}
$$

because $S_{ik}$ is nonzero only when $k = i$. So $SQ_{ij} = s_i Q_{ij} = \hat W_{ij}$, exactly the per-channel rule. The diagonal matrix is just a tidy way to write "scale row $i$ by $s_i$".

## 5.3 The general picture

Both schemes share the same shape: pick scales, divide, round, clamp to integers, then recover by multiplying back.

$$
\begin{equation}
W \xrightarrow{\ \text{quantize}\ } Q \in \mathbb{Z}^{m \times n} \xrightarrow{\ \text{dequantize}\ } \hat{W} = S Q \approx W
\end{equation}
$$

Per-tensor is the special case $S = s I$ (every diagonal entry equal). Per-channel lets the diagonal vary. The matrix $Q$ holds the compact integers we actually store; $S$ holds the handful of floats needed to bring them back to real scale.

# 6. Applying Quantization in Network Inference

A linear (fully-connected) layer computes

$$
\begin{equation}
\mathbf{y} = W \mathbf{x} + \mathbf{b}
\end{equation}
$$

for an input activation vector $\mathbf{x} \in \mathbb{R}^{n}$. Quantization changes *how* this product is computed. There are two common modes.

## 6.1 Weight-only quantization

Here only the weights are quantized; the activations $\mathbf{x}$ stay in floating point. Substitute $\hat{W} = S Q$ for $W$:

$$
\begin{equation}
\mathbf{y} \approx \hat{W} \mathbf{x} + \mathbf{b} = S\, Q\, \mathbf{x} + \mathbf{b}
\end{equation}
$$

Because $S$ is diagonal, it factors out of the matrix product. Writing the $i$-th output:

$$
\begin{equation}
y_i \approx s_i \left( \sum_{j=1}^{n} Q_{ij}\, x_j \right) + b_i
\end{equation}
$$

The expensive inner sum uses the compact integer weights $Q_{ij}$, and the float scale $s_i$ is applied **once per output**, after the sum — not on every term. This is why per-channel scaling is almost free at runtime: a single multiply per output feature.

## 6.2 Full integer quantization

For maximum speed we also quantize the activations, so the matrix multiply itself runs in integer arithmetic. Quantize $\mathbf{x}$ with its own (per-tensor) symmetric scale $s_x$:

$$
\begin{equation}
x_j \approx s_x\, q_{x,j}
\end{equation}
$$

Combine with the per-channel weight quantization $W_{ij} \approx s_i Q_{ij}$:

$$
\begin{equation}
y_i = \sum_{j=1}^{n} W_{ij}\, x_j + b_i \approx \sum_{j=1}^{n} (s_i Q_{ij})(s_x q_{x,j}) + b_i
\end{equation}
$$

Both scales are constants for a given row, so pull them out of the sum:

$$
\begin{equation}
y_i \approx s_i\, s_x \left( \sum_{j=1}^{n} Q_{ij}\, q_{x,j} \right) + b_i
\end{equation}
$$

The sum $\sum_j Q_{ij} q_{x,j}$ is a pure **integer dot product**: `INT8` times `INT8`, accumulated into an `INT32` register. Only after the accumulation do we multiply by the combined float scale $s_i s_x$ and add the bias. This is exactly how integer inference engines run a linear layer.

## 6.3 Asymmetric activations and the zero-point term

Activations after a ReLU are one-sided, so they are often quantized **asymmetrically** with a zero-point $z_x$:

$$
\begin{equation}
x_j \approx s_x (q_{x,j} - z_x)
\end{equation}
$$

Plugging this in and expanding the dot product separates into two integer sums:

$$
\begin{equation}
y_i \approx s_i\, s_x \sum_{j=1}^{n} Q_{ij}\, (q_{x,j} - z_x) + b_i = s_i\, s_x \left( \sum_{j=1}^{n} Q_{ij}\, q_{x,j} \;-\; z_x \sum_{j=1}^{n} Q_{ij} \right) + b_i
\end{equation}
$$

The first sum is the same integer matmul as before. The second sum, $\sum_j Q_{ij}$, depends **only on the (static) weights**, so it is precomputed once and reused for every input. At runtime the zero-point costs nothing extra beyond a precomputed constant — the heavy work is still a single integer matrix multiply.

# 7. Quantization Error

Quantization is lossy, so it is worth knowing exactly how big the error is and how it flows through a layer.

## 7.1 Per-element error

For a symmetric scale $s$, the quantized-then-dequantized value is $\hat r = s \cdot \text{round}(r / s)$. Let $u = r/s$; rounding moves it by at most half a unit, $|\text{round}(u) - u| \le \tfrac{1}{2}$. Multiplying by $s$:

$$
\begin{equation}
|\hat{r} - r| \le \frac{s}{2}
\end{equation}
$$

So **the worst-case error of any single value is half a step**. For a per-channel weight matrix, row $i$ uses scale $s_i$, so each entry obeys

$$
\begin{equation}
|\hat W_{ij} - W_{ij}| \le \frac{s_i}{2}
\end{equation}
$$

A smaller scale (more bits, or per-channel instead of per-tensor) directly shrinks this bound.

## 7.2 A statistical view

The bound above is the worst case. In practice the rounding residual behaves like a uniform random variable on $[-\tfrac{s}{2}, \tfrac{s}{2}]$. Such a variable has mean $0$ and variance

$$
\begin{equation}
\text{Var}[\hat{r} - r] = \frac{s^2}{12}
\end{equation}
$$

so the typical (root-mean-square) error is $\frac{s}{\sqrt{12}} \approx 0.29\, s$ — noticeably smaller than the worst case $\frac{s}{2}$, and centered on zero so it does not systematically bias the result.

## 7.3 How the error propagates through a layer

Define the weight error matrix $E = \hat{W} - W$, with entries $e_{ij} = \hat W_{ij} - W_{ij}$. For weight-only quantization the output error is

$$
\begin{equation}
\delta \mathbf{y} = \hat{W}\mathbf{x} - W\mathbf{x} = E \mathbf{x}
\end{equation}
$$

Per output element, $\delta y_i = \sum_j e_{ij} x_j$. Using $|e_{ij}| \le s_i/2$ gives a worst-case bound:

$$
\begin{equation}
|\delta y_i| \le \sum_{j=1}^{n} |e_{ij}|\,|x_j| \le \frac{s_i}{2} \sum_{j=1}^{n} |x_j| = \frac{s_i}{2}\, \|\mathbf{x}\|_1
\end{equation}
$$

Treating the $e_{ij}$ as independent, zero-mean, variance-$\frac{s_i^2}{12}$ noise gives the expected squared error:

$$
\begin{equation}
\mathbb{E}[\,\delta y_i^2\,] = \sum_{j=1}^{n} \text{Var}[e_{ij}]\, x_j^2 = \frac{s_i^2}{12} \sum_{j=1}^{n} x_j^2 = \frac{s_i^2}{12}\, \|\mathbf{x}\|_2^2
\end{equation}
$$

so the typical output error scales as $\frac{s_i}{\sqrt{12}} \|\mathbf{x}\|_2$. Two takeaways fall out of these formulas:

1. **Error grows with the scale $s_i$.** More bits or finer (per-channel) granularity shrinks $s_i$, and the output error shrinks with it.
2. **Error grows with the input size.** Wider layers (larger $n$, larger $\|\mathbf{x}\|$) accumulate more rounding noise — which is why very large layers can be more sensitive to quantization.

This is the foundation. Calibrated and learned methods (GPTQ, AWQ, QAT) all aim to reduce these same error terms — but they start from exactly the equations above.

