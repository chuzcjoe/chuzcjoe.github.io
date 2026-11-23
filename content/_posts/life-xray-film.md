---
title: 机场安检与胶卷
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
date: 2025-05-05 23:44:25
tags: [film]
categories:
- life
---

在很多美国机场的安检处，都能看到这样的标语

<!-- more -->

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/life/xray-film/ad.jpg" title="Image 1" width="300px" height="200px">
</p>

意思是说安检的x光对于ISO800以下的胶卷没有影响，但对于800以上的，就不好说了。想要理解这句话，首先我们要从胶卷的基本原理讲起。

1. 胶卷是什么？
  - 胶卷是一种覆盖了感光材料（乳剂 emulsion）的塑料薄片，这些感光材料主要是卤化银颗粒（AgBr、AgCl 等），它们对光线非常敏感。

2. 拍照时发生了什么？
  - 当你按下快门、打开快门帘时，镜头会把光线投射到胶卷上，光线照射到的区域：
  - 感光颗粒会吸收光子，形成“潜影”（看不见的图像）；
  - 之后你拿去显影，这些曝光过的颗粒在化学反应中变成黑色金属银，形成可见的影像；
  - 曝光越多，越黑；曝光越少，越亮；这就是所谓的“底片”。


ISO值本质上就是胶卷对光的“敏感程度”。
- ISO高（如1600）：里面的感光颗粒更大、数量更多 → 更容易被X光激发；
- ISO低（如100）：颗粒更小、密度低 → 不太容易被激发；

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/life/xray-film/iso.jpg" title="Image 1" width="600px" height="300px">
</p>

胶卷相机通常配不同ISO值的胶卷进行拍摄来适应不同的环境光亮度

常见的胶卷 ISO 值
| ISO 值        | 特点                             | 使用场景               |
|---------------|----------------------------------|------------------------|
| 100           | 清晰、颗粒少，但感光低           | 户外、阳光充足         |
| 200           | 稍微感光强一点，画质仍很好       | 室外或明亮室内         |
| 400           | 通用型，适合多数情况             | 室内、阴天、街拍       |
| 800           | 更适合暗光拍摄，但颗粒更明显     | 夜景、室内无闪光灯     |
| 1600 / 3200   | 高感光，颗粒重、对比强           | 演出、新闻、低光环境   |

X射线也是电磁波，它的原理跟可见光差不多，只不过能量更高，波长更短。这些高能量的射线也会作用在卤化银颗粒上，就像强光一样，在胶卷上留下“假影”。轻微的影响会使得整体画面出现轻度“雾化”——底片灰度提高、对比度下降。严重的情况下会出现条纹、斑点、噪点状污染，尤其在高感光度胶卷上更明显。这些影响是无法通过后期修复的，因为胶卷已经被“假曝光”了。

总结起来，“X光对ISO800以下胶卷无影响”是一种经验性、概率性判断，在一次安检中通常是成立的。但它并非绝对保险，胶卷越高感度、安检次数越多（X光剂量积累）、使用的安检设备越强，对影像质量影响的风险也就越大。