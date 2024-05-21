---
title: YUV Color Format
author: Joe Chu
date: 2024-05-12 22:54:09
tags: [color]
categories:
- CGV
---

What is YUV?
How is it stored?
What are the variants?

<!-- more -->

# 1. What is YUV?

YUV format represents an image as three planes: Y, U and V. Y is the luma plane. U and V are reffered to as the chroma planes, which are basically the colors. All the YUV formats have these three planes, and differ by the different orderings of them. YUV is also referred as YCbCr (Y, color blue, color red).

**Note: U-Cb, V-Cr.**

<p align="center">
    <img src="yuv_intro.png" title="A regular image" width="700px" height="800px">
</p>

# 2. Chroma Subsampling

Various YUV formats, like 420, 422, and others, are often mentioned. This is because downsampling is typically applied to chroma planes, considering that the human eye is less perceptive to color than luminance. So, we could save more space by keeping less information about colors.

The subsampling scheme is commonly expressed as a three-part ratio `J:a:b` (e.g. 4:2:2), that describe the number of luminance and chrominance samples in a conceptual region that is J pixels wide and 2 pixels high.

<p align="center">
    <img src="sampling.png" title="A regular image" width="700px" height="900px">
</p>


- J: horizontal sampling reference (width of the conceptual region). Usually, 4.
- a: number of chrominance samples (Cr, Cb) in the first row of J pixels.
- b: number of changes of chrominance samples (Cr, Cb) between first and second row of J pixels. b has to be either zero or equal to a.

Let's assume that:

- Image resolution is {% katex %} W*H {% endkatex %}.
- J:a:b = 4:2:0 (YUV420)

<p align="center">
    <img src="yuv420.png" title="A regular image" width="200px" height="200px">
</p>
<p align="center">
    <em>For YUV420, each U(V) corresponds to a 2x2 Y block. In other words, one pair of UV corresponds to 4(2x2) Y pixels.</em>
</p>

Then we have resolutions for Cb and Cr planes:

- Cb plane: {% katex %} W/2 * H/2 {% endkatex %}.
- Cr plane: {% katex %} W/2 * H/2 {% endkatex %}.

# 3. Pixel Order

YUV formats are either:

1. Packed (or interleaved)
2. Planar (the names of those formats often end with "p")
3. Semi-planar (the names of those formats often end with "sp")

## 3.1 Packed(interleaved)

`Y1U1Y2V1 Y3U2Y4V2 ... ...`

## 3.2 Planar

`[Y1Y2......][Cb1Cb2......][Cr1Cr2.......]`

<p align="center">
    <img src="planar.png" title="A regular image" width="300px" height="300px">
</p>

## 3.3 Semi-planar

`[Y1Y2......][Cb1Cr1Cb2Cr2......]`

<p align="center">
    <img src="semi-planar.png" title="A regular image" width="300px" height="300px">
</p>

## 3.4 Different types of YUV420

| YUV420 format | Order | Detail                                                                     |
|---------------|-------|----------------------------------------------------------------------------|
| i420          | Y+U+V | Three planes are separated. U comes before V.                              |
| YV12          | Y+V+U | Three planes are separated. V comes before U.                              |
| NV12          | Y+UV  | Y plane is separated from UV plane. UVs are interleaved. U comes before V. |
| NV21          | Y+U+V | Y plane is separated from UV plane. UVs are interleaved. V comes before U. |

# 4. YUV420 to YUV

<p align="center">
    <img src="yuv420toyuv.png" title="A regular image" width="800px" height="800px">
</p>
<p align="center">
    <em>A general YUV420 example and its YUV conversion.</em>
</p>

Based on the above figure, let's say we want to get {% katex %} YUV(5,2) {% endkatex %}, which is {% katex %} Y_{33}U_{8}V_{8} {% endkatex %}. What we need from {% katex %} i420 {% endkatex %} are:

<p align="center">
{% katex %}
    Y_{33} \rightarrow i420(5,2) \\

    U_8 \rightarrow i420(7,1) \\

    V_8 \rightarrow i420(8,4)
{% endkatex %}
</p>

The position of `Y` in i420 should keep the same as in YUV. So we have:

<p align="center">
{% katex %}
    Y(x,y) = i420(x,y) 
{% endkatex %}
</p>

Then, in order to get the position of {% katex %} U_8 {% endkatex %} in i420, let's first compute the offset in U plane given {% katex %} x, y, w {% endkatex %}

<p align="center">
{% katex %}
    i = \frac{x}{2} * \frac{w}{2} + \frac{y}{2}
{% endkatex %}
</p>

In this case, {% katex %} i = \frac{5}{2} * \frac{6}{2} + \frac{2}{2} = 7 {% endkatex %}, which is expected due to zero indexing. Then, we can get the position of {% katex %} U_8 {% endkatex %} in i420 as:

<p align="center">
{% katex %}
    U(x, y) = i420(\frac{i + w * h}{w}, (i + w * h) \% w)
{% endkatex %}
</p>

To get the position of {% katex %} V_8 {% endkatex %} in i420, we need to skip the U plane and repeat the same compute.

<p align="center">
{% katex %}
    V(x, y) = i420(\frac{i + w * h * 1.25}{w}, (i + w * h * 1.25) \% w)
{% endkatex %}
</p>

Other YUV420 formats such as YV12, NV12 and NV21 can also be converted to YUV in similar approaches.

# References
- https://en.wikipedia.org/wiki/Chroma_subsampling#Sampling_systems_and_ratios
- https://juejin.cn/post/7207637337572606007
