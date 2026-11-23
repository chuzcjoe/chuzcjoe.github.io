---
title: Exposure Value in Photography
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
date: 2025-02-22 20:49:25
tags: [exposure value]
categories:
- CGV
---

In photography, exposure value represents the combination of shutter speed and aperture size.

<!-- more -->

# 1. Introduction

**Exposure Value (EV)** in photography is a single number that represents the combination of aperture and shutter speed that determine how much light reaches your camera’s sensor. It’s a handy way to quantify exposure across different settings, making it easier to adjust or compare them.

EV measures exposure on a logarithmic scale where each step (1 EV) corresponds to a doubling or halving of light—also called a "stop." EV can be calculated using this formula:

$$ 
\begin{equation} 
EV = log_2\frac{N^2}{t}
\end{equation} 
$$

where:
- $N$ is the f-number (aperture size).
- $t$ is the shutter speed (in seconds).

**EV 0** is standardized as the exposure from an aperture of f/1, a shutter speed of 1 second. A higher **EV** indicates a brighter scene requiring `smaller` apertures (`higher` f-numbers) or `faster` shutter speeds, while a lower EV indicates a darker scene requiring wider apertures or slower shutter speeds.

**EV 1** can be achieved by changing either aperture or shutter speed, or both.

**Change aperture**:
Aperture is controlled by the f-number (N) and the amount of light entering the camera is proportional to $1/N^2$
$$ 
\begin{equation} 
LightIntensity \propto \frac{1}{N^2}
\end{equation} 
$$

This means that to double the light (increase by 1 EV) or halve the light (decrease by 1 EV), the relationship between the old and new f-numbers must satisfy:
$$ 
\begin{equation} 
\frac{1}{N\prime^2} = 2 * \frac{1}{N^2}
\end{equation} 
$$

Taking the square root on both sides:
$$ 
\begin{equation} 
N\prime = \frac{N}{\sqrt{2}}
\end{equation} 
$$

This means a 1 EV change in aperture corresponds to multiplying or dividing the f-number by $\sqrt{2} \approx 1.414$

**Change shutter speed**:
To change exposure by 1 EV, we must double or halve the light intensity. Since light is directly proportional to shutter speed, we can multiply or divide the exposure time by 2.

You can achieve the same EV with different settings:

f/2.8, 1/125s
$$ 
\begin{equation} 
EV = log_2\frac{2.8^2}{\frac{1}{125}} \approx 9.9
\end{equation} 
$$

f/4, 1/60s
$$ 
\begin{equation} 
EV = log_2\frac{4^2}{\frac{1}{60}} \approx 9.9
\end{equation} 
$$

Common EV values and their corresponding lighting conditions:
| EV   | Lighting Condition                          |
|------|-------------------------------------------|
| -6 to -3 | Night with minimal light sources      |
| 0 to 3   | Indoor lighting or dimly lit streets  |
| 4 to 7   | Overcast days or indoors with bright windows |
| 8 to 11  | Open shade or indoor well-lit areas   |
| 12 to 15 | Bright daylight or sunny conditions   |
| 16+      | Snowy landscapes, beach scenes, or direct sunlight |

# 2. EV Step

An EV step (or stop) refers to a change in exposure value by a factor of `2×` or `1/2×` in terms of light intensity. Each step up doubles the amount of light, while each step down halves it.

- Increase by 1 EV: Doubles the light (e.g., brighter image).
- Decrease by 1 EV: Halves the light (e.g., darker image).

A 1 EV step can be achieved by adjusting one of the exposure settings:

- Aperture (f-stop): Changing the f-number by a factor of $\sqrt(2) \approx 1.4$
  - Example: f/2 → f/2.8 (1 EV decrease), f/5.6 → f/4 (1 EV increase).
- Shutter Speed: Doubling or halving the duration.
  - Example: 1/60s → 1/30s (1 EV increase), 1/250s → 1/500s (1 EV decrease).

Modern cameras often let you fine-tune in smaller increments such as `1/3 EV` and `1/2 EV`. Since the Exposure Value (EV) is defined in a logarithmic scale, we need to change aperture size and shutter speed by the factor of 2.

In order to change `1/3 EV`, we need to adjust:

- Aperture
  - $N^{\prime} = \frac{N}{\sqrt[6]{2}}$

- Shutter speed
  - $t^{\prime} = t * 2^{\frac{1}{3}}$

# 3. Mobile Phone Cameras

Since mobile cameras have `fixed apertures`, the primary ways they control EV are by adjusting shutter speed (exposure time) and ISO sensitivity. They may also use HDR and computational techniques to balance exposure across different parts of the image.

For example, if the camera needs to brighten the image (increase EV), it can slow down the shutter speed, increase ISO, or combine multiple exposures in HDR.
To decrease EV (darken the image), it can speed up the shutter, decrease ISO, or merge less-exposed images.


# References
- https://en.wikipedia.org/wiki/Exposure_value