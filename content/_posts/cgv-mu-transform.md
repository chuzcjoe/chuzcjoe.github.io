---
title: Mu Transform
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
    index: true
    collapsed: true
    depth: 3
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2025-02-04 21:30:43
tags: [image processing]
categories:
- CGV
---

Mu transform is an image enhancement technique. In this post, we will introduce 3 variants of mu transform.

<!-- more -->

In image processing, Mu Transform (μ-Transform) is a non-linear transformation used to enhance image contrast, particularly in applications like medical imaging and remote sensing. It is a type of contrast enhancement technique that adjusts pixel intensities to improve visibility of details in an image.

# 1. Generalized Mu Transform

$$ 
\begin{equation} 
I^{\prime} = \frac{I^{\mu}}{I^{\mu} + \lambda(1 - I)^{\mu}}
\end{equation} 
$$

where:

- $I$ is the normalized input pixel intensity (ranging from 0 to 1).
- $I^{\prime}$ is the transformed output pixel intensity.
- $\mu$ is the transformation parameter that controls the contrast enhancement.
- $\lambda$ controls the balance between bright and dark regions. When $\lambda > 1$, it increases contrast in bright regions. When $\lambda < 1$, it enhances dark regions.

# 2. Log-Mu Transform

This variant combines the logarithmic transformation with the Mu Transform to enhance details in both dark and bright regions:

$$ 
\begin{equation} 
I^{\prime} = log(1 + c \times \frac{I^{\mu}}{I^{\mu} + (1 - I)^{\mu}})
\end{equation} 
$$

where 
- $c$ is a scaling constant.
- This variant is useful for HDR (High Dynamic Range) imaging.

# 3. Adaptive Mu Transform
Instead of using a fixed $\mu$ for the entire image, an adaptive version computes $\mu$ based on local image statistics (like mean or variance). A common approach is:

$$ 
\begin{equation} 
\mu(x, y) = \alpha + \beta \times Var(I_{local})
\end{equation} 
$$

where:
- $\alpha$ and $\beta$ are user-defined parameters.
- $Var(I_{local})$ is the local variance around pixel $(x,y)$.
- This allows spatially adaptive contrast enhancement, which is useful in medical imaging and low-light conditions.

# 4. Example

```python exmaple.py
import cv2
import numpy as np
import matplotlib.pyplot as plt

def apply_mu_transform(image, transform_func, **kwargs):
    """Applies Mu Transform to each RGB channel separately."""
    channels = cv2.split(image)  # Split into R, G, B
    transformed_channels = [transform_func(ch, **kwargs) for ch in channels]
    return cv2.merge(transformed_channels)  # Merge back to RGB

def generalized_mu_transform(image, mu=2.0, lambda_=1.0):
    """Generalized Mu Transform for RGB images."""
    I = image.astype(np.float32) / 255.0  # Normalize
    I_transformed = (I**mu) / (I**mu + lambda_ * (1 - I)**mu)
    return (I_transformed * 255).astype(np.uint8)  # Convert back

def log_mu_transform(image, mu=2.0, c=1.0):
    """Log-Mu Transform for RGB images."""
    I = image.astype(np.float32) / 255.0
    I_mu = (I**mu) / (I**mu + (1 - I)**mu)
    I_transformed = np.log1p(c * I_mu)
    I_transformed /= np.max(I_transformed)  # Normalize
    return (I_transformed * 255).astype(np.uint8)

def adaptive_mu_transform(image, alpha=1.0, beta=10.0):
    """Adaptive Mu Transform for RGB images (local contrast-based)."""
    I = image.astype(np.float32) / 255.0
    kernel_size = 7
    mean_local = cv2.blur(I, (kernel_size, kernel_size))
    variance_local = cv2.blur(I**2, (kernel_size, kernel_size)) - mean_local**2
    mu_adaptive = alpha + beta * variance_local
    I_transformed = (I**mu_adaptive) / (I**mu_adaptive + (1 - I)**mu_adaptive)
    return (I_transformed * 255).astype(np.uint8)

# Load RGB image
image = cv2.imread("save.jpg")
image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert BGR to RGB

# Apply Mu Transforms
gen_mu_img = apply_mu_transform(image, generalized_mu_transform, mu=3.0, lambda_=1.0)
log_mu_img = apply_mu_transform(image, log_mu_transform, mu=3.0, c=2.0)
adaptive_mu_img = apply_mu_transform(image, adaptive_mu_transform, alpha=1.0, beta=5.0)

# Plot results in a 2x2 grid
plt.figure(figsize=(10, 10))

plt.subplot(2, 2, 1)
plt.imshow(image)
plt.title("Original")
plt.axis("off")

plt.subplot(2, 2, 2)
plt.imshow(gen_mu_img)
plt.title("Generalized Mu Transform")
plt.axis("off")

plt.subplot(2, 2, 3)
plt.imshow(log_mu_img)
plt.title("Log-Mu Transform")
plt.axis("off")

plt.subplot(2, 2, 4)
plt.imshow(adaptive_mu_img)
plt.title("Adaptive Mu Transform")
plt.axis("off")

plt.tight_layout()  # Adjust layout for better spacing
plt.show()
```

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/cgv/mu-transform/mu_transform.png" title="A regular image" width="800px" height="600px">
</p>