---
title: Color Transfer Function
author: Joe Chu
toc: true
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
date: 2024-08-17 15:29:44
tags: [color transfer function]
categories:
- CGV
---

OETF, EOTF & OOTF

<!-- more -->

# 1. What is Color Transfer Function?

Our eyes perceive light differently from cameras do. A camera will yield linear output with respect to the input light intensity. However, human vision has its non-linearity property and is more sensetive to color differences especially in dark regions. In order to mimic how human vision system responds to light, we need color transfer function to adapt camera out or display brightness.

# 2. OETF, EOTF and OOTF

`OETF`(Opto-Electronic Transfer Function) describes how light information captured by a camera or image sensor is converted into an electrical signal, which is then encoded into a digital image signal. Essentially, the OETF defines the relationship between the light intensity captured by the sensor and the corresponding signal output used for storage, processing, or transmission.

`EOTF`(Electro-Optical Transfer Function) describes how the digital image data (electrical signals) are converted back into light (optical signals) by a display device.

`OOTF` stands for Opto-Optical Transfer Function. It represents the overall transfer function from the scene light captured by a camera to the light emitted by a display, combining both the Opto-Electronic Transfer Function (OETF) and the Electro-Optical Transfer Function (EOTF).

<p align="center">
    <img src="colortransferfunction.png" title="A regular image" width="700px" height="800px">
</p>

The encoded digital signal is in non-linear space. Sometimes, when we need to performan certain operations such as color space conversion, we must first linearize the signal and do the operations within the linear space.

# 3. sRGB

sRGB color space is non-linear and is encoded using a non-linear transfer function.

**OETF**

$$
V^{\prime} = \begin{cases} 
12.92 \cdot V & V \leq 0.0031308 \\\\
1.055 \cdot V^{1/2.4} - 0.055 &  V > 0.0031308
\end{cases}
$$

**EOTF**

$$
V = \begin{cases} 
\frac{V^{\prime}}{12.92} & V^{\prime} \leq 0.04045 \\\\
(\frac{V^{\prime}+0.055}{1.055})^{2.4} &  V^{\prime} > 0.04045
\end{cases}
$$

More details can be found at khronos specifications: https://registry.khronos.org/DataFormat/specs/1.3/dataformat.1.3.inline.html#TRANSFER_HLG:~:text=0.081242858298635-,13.3.%C2%A0sRGB%20transfer%20functions,-13.3.1.%C2%A0sRGB%20EOTF

# 4. Hybrid-Log-Gamma

The hybrid log–gamma (HLG) transfer function is a transfer function jointly developed by the BBC and NHK for high dynamic range (HDR) display.

**OETF**

The BT.2100-2 Hybrid Log Gamma description defines the following OETF for linear scene light:

$$
V^{\prime} = \begin{cases} 
\sqrt{3V} &  0 \leq V \leq \frac{1}{12} \\\\
aln(12V-b)+c &  \frac{1}{12} < V \leq 1
\end{cases}
$$

Where $a=0.17883277$, $b=0.28466892$, c=$0.55991073$

More details can be found at: https://registry.khronos.org/DataFormat/specs/1.3/dataformat.1.3.inline.html#TRANSFER_HLG:~:text=lift%20(legacy%20%E2%80%9Cbrightness%E2%80%9D)-,13.5.%C2%A0BT.2100%20HLG%20transfer%20functions,-HLG%20(and%20PQ

# References

https://registry.khronos.org/DataFormat/specs/1.3/dataformat.1.3.inline.html#TRANSFER_HLG
https://en.wikipedia.org/wiki/Hybrid_log%E2%80%93gamma
https://blogs.telestream.net/2022/11/transfer-functions-and-their-functions-in-high-dynamic-range-workflow/