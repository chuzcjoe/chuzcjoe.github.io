---
title: YUV and RGB Color Space Conversion
author: Joe Chu
date: 2024-05-16 12:46:49
tags: [yuv, rgb]
categories:
- CGV
---

YUV to RGB, RGB to YUV

<!-- more -->

# 1. Introduction

In the YUV color format:

- Y (Luminance): Represents the brightness or intensity of the color. It carries the grayscale image information.
- U (Chrominance Blue): Represents the blue color difference, which is the difference between the blue component and the luminance (Y). It adds the blue color information to the image.
- V (Chrominance Red): Represents the red color difference, which is the difference between the red component and the luminance (Y). It adds the red color information to the image.

# 2. RGB to YUV

Based on the definition above, converting RGB to YUV involves combining the RGB channels in specific proportions.

<p align="center">
$$
Y = K_r * R + K_g * G + K_b * B \\
U = \frac{1}{2} * \frac{B-Y}{1-K_b} \\
V = \frac{1}{2} * \frac{R-Y}{1-K_r}
$$
</p>

$ K_r, K_g, K_b $ are different ratios to blend RGB channels.

**Note**
Let's assume the input RGB image has values ranging from 0 to 1.

1. $ K_r + K_g + K_b = 1$
2. $ U \in [-0.5, 0.5] $
3. $ V \in [-0.5, 0.5] $

Several reasons for UV ranging from -0.5 to 0.5:
| Benifit | Detail |
|---|---|
| Centering Around Zero | Zero represents no color difference from the luminance. |
| Color Balance | Allows for a balanced representation of color differences. This range is symmetric, ensuring equal representation for both positive and negative deviations from the luminance, which helps in accurately reconstructing the color during the conversion back to RGB. |
| Normalization | The range is normalized to fit within a compact interval, which is efficient for encoding and transmission. |

# 3. XYZ Color Space

The XYZ color space, also known as the CIE 1931 color space, is a color space defined by the International Commission on Illumination (CIE) in 1931. It is based on human vision and is designed to be a device-independent representation of color. Here are the key components:

The CIE color space has been transformed to a two-dimensional, horseshoe-shaped graph of the luminance (brightness) and chromaticity (color) values perceived by humans. The chromaticity coordinates of any point on the graph are labeled x and y (or Cx and Cy).

<p align="center">
    <img src="cie.png" title="A regular image" width="350" height="350">
</p>

XYZ and RGB color spaces can be converted interchangeably.

**From RGB to XYZ**

$$
\begin{equation}
\left[\begin{array}{l}
X \\\\
Y \\\\
Z
\end{array}\right]=\left[\begin{array}{lll}
0.4124564 & 0.3575761 & 0.1804375 \\\\
0.2126729 & 0.7151522 & 0.0721750 \\\\
0.0193339 & 0.1191920 & 0.9503041
\end{array}\right]\left[\begin{array}{l}
R \\\\
G \\\\
B
\end{array}\right]
\end{equation}
$$

**From XYZ to RGB**

$$
\left[\begin{array}{l}
R \\\\
G \\\\
B
\end{array}\right]=\left[\begin{array}{ccc}
3.2404542 & -1.5371385 & -0.4985314 \\\\
-0.9692660 & 1.8760108 & 0.0415560 \\\\
0.0556434 & -0.2040259 & 1.0572252
\end{array}\right]\left[\begin{array}{l}
X \\\\
Y \\\\
Z
\end{array}\right]
$$

# 4. BT709 and BT2020

BT.709 and BT.2020 are standards developed by the International Telecommunication Union (ITU) for different aspects of video technology, specifically for encoding and broadcasting high-definition television (HDTV) and ultra-high-definition television (UHDTV), respectively.

## 4.1 BT.709(Rec.709)

|  | Detail |
|---|---|
| Definition | It is the standard for HDTV. |
| Resolutio  | Typically used for 1080p (1920x1080 pixels) and 720p (1280x720 pixels) resolutions. |
| Color Space | Defines the color space used for HD video, specifying the RGB color primaries, white point (D65), and the transfer function (gamma curve). |
| Color Primaries | Red: (0.640, 0.330)<br>Green: (0.300, 0.600)<br>Blue: (0.150, 0.060) |
| Transfer Function | optical-electro transfer function: $$ V = 1.099L ^{0.45} - 0.099, V > 0.018 $$ $$ V = 0.45L, V \leq 0.018 $$ where V is the digital signal and L is the luminance, and both are in the range [0,1].|
| Bit Depth | Usually 8-bit or 10-bit per channel. |

# 4.2 BT.2020(Rec.2020)

|  | Detail |
|---|---|
| Definition | It is the standard for UHDTV, including 4K (3840x2160 pixels) and 8K (7680x4320 pixels) resolutions. |
| Color Space | Defines a wider color gamut compared to BT.709, aiming to cover a broader range of colors visible to the human eye. |
| Color Primaries | Red: (0.708, 0.292)<br>Green: (0.170, 0.797)<br>Blue: (0.131, 0.046) |
| Transfer Function | $$ \begin{equation} E^{\prime} = \begin{cases} 4.5 E & 0 \leq E<\beta \\\\ \alpha E^{0.45}-(\alpha-1) & \beta \leq E \leq 1 \\\\ \end{cases} \end{equation} $$ 1. where E is the signal proportional to camera-input light intensity and E′ is the corresponding nonlinear signal.  2. where α = 1 + 5.5 * β ≈ 1.09929682680944 and β ≈ 0.018053968510807 (values chosen to achieve a continuous function with a continuous first derivative)  |
| Bit Depth | Typically 10-bit or 12-bit per channel, allowing for higher color precision and better handling of HDR content. |
| HDR | Supports HDR, providing greater contrast and more vivid colors. |

# 5. YUV and RGB Conversion

## 5.1 For BT709

As previously mentioned, the relationship between YUV and RGB can be defined as:

$$
Y = K_r * R + K_g * G + K_b * B \\\\
U = \frac{1}{2} * \frac{B-Y}{1-K_b} \\\\
V = \frac{1}{2} * \frac{R-Y}{1-K_r}
$$

And RGB to XYZ can be defined as:

$$
\begin{equation}
\left[\begin{array}{l}
X \\\\
Y \\\\
Z
\end{array}\right]=\left[\begin{array}{lll}
0.4124 & 0.3576 & 0.1805 \\\\
0.2126 & 0.7152 & 0.0722 \\\\
0.0193 & 0.1192 & 0.9505
\end{array}\right]\left[\begin{array}{l}
R \\\\
G \\\\
B
\end{array}\right]
\end{equation}
$$

$Y$ in XYZ is essentially the luminance. So, $K_r=0.2126, K_g=0.7152, K_b=0.0722$. And we substitue the values to RGB-YUV euqation.

$$
\begin{aligned}
& Y=0.2126 \cdot R+0.7152 \cdot G+0.0722 \cdot B \\\\
& U=\frac{B-Y}{1.8556} \\\\
& V=\frac{R-Y}{1.5748}
\end{aligned}
$$

By substituting $Y$ to the other two equations.

$$
\begin{aligned}
& Y=0.212600 \cdot R+0.715200 \cdot G+0.072200 \cdot B \\\\
& U=-0.114572 \cdot R-0.385428 \cdot G+0.5 \cdot B \\\\
& V=0.5 \cdot R-0.454153 \cdot G-0.045847 \cdot B
\end{aligned}
$$

We can get the conversion matrix $M$ rom RGB to YUV,

$$
\left[\begin{array}{l}
Y \\\\
U \\\\
V
\end{array}\right]=\left[\begin{array}{ccc}
0.212600 & 0.715200 & 0.072200 \\\\
-0.114572 & -0.385428 & 0.500000 \\\\
0.500000 & -0.454153 & -0.045847
\end{array}\right] \cdot\left[\begin{array}{l}
R \\\\
G \\\\
B
\end{array}\right]
$$

To get the conversion matrix from YUV to RGB, we compute the inverse matrix $M^{-1}$

$$
\left[\begin{array}{l}
R \\\\
G \\\\
B
\end{array}\right]=\left[\begin{array}{ccc}
1.000000 & -0.000000 & 1.574800 \\\\
1.000000 & -0.187324 & -0.468124 \\\\
1.000000 & 1.855600 & -0.000000
\end{array}\right] *\left[\begin{array}{l}
Y \\\\
U \\\\
V
\end{array}\right]
$$

## 5.2 For BT2020

Similar to BT709, except that the conversion matrix from RGB to XYZ becomes:

$$
\begin{equation}
\left[\begin{array}{l}
X \\\\
Y \\\\
Z
\end{array}\right]=\left[\begin{array}{lll}
0.636958 & 0.144617 & 0.168881 \\\\
0.262700 & 0.678000 & 0.059300 \\\\
0.000000 & 0.028073 & 1.060985
\end{array}\right]\left[\begin{array}{l}
R \\\\
G \\\\
B
\end{array}\right]
\end{equation}
$$

I will start a new chapter to discuss how we can compute this conversion matrix.

If we repeat the previous steps, we can get:

$$
\left[\begin{array}{l}
Y \\\\
U \\\\
V
\end{array}\right]=\left[\begin{array}{ccc}
0.262700 & 0.678000 & 0.059300 \\\\
-0.139630 & -0.360370 & 0.500000 \\\\
0.500000 & -0.459786 & -0.040214
\end{array}\right] *\left[\begin{array}{l}
R \\\\
G \\\\
B
\end{array}\right]
$$

$$
\left[\begin{array}{l}
R \\\\
G \\\\
B
\end{array}\right]=\left[\begin{array}{ccc}
1.000000 & -0.000000 & 1.474600 \\\\
1.000000 & -0.164553 & -0.571353 \\\\
1.000000 & 1.881400 & -0.000000
\end{array}\right] *\left[\begin{array}{l}
Y \\\\
U \\\\
V
\end{array}\right]
$$

# Refernce
- https://luminusdevices.zendesk.com/hc/en-us/articles/4414846186253-What-is-the-CIE-Color-Space-What-s-the-difference-between-CIE-1931-and-CIE-1976
- https://www.oceanopticsbook.info/view/photometry-and-visibility/from-xyz-to-rgb
- https://www.color.org/chardata/rgb/BT709.xalter
- http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html