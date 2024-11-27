---
title: 宝宝七个月了
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
date: 2024-11-18 15:54:22
tags: [baby]
categories:
- life
---

七月打卡

<!-- more -->

<p align="center">
    <img src="0.jpg" title="A regular image" width="800px" height="700px">
</p>

<p align="center">
    <img src="1.jpg" title="A regular image" width="800px" height="700px">
</p>

<p align="center">
    <img src="3.jpg" title="A regular image" width="600px" height="500px">
</p>

<p align="center">
    <img src="4.jpg" title="A regular image" width="600px" height="500px">
</p>

# Image Slideshow

<div id="slideshow-container">
    <div class="frame">
        <img id="slideshow">
        <button class="nav-btn prev-btn" onclick="showPrevImage()">❮</button>
        <button class="nav-btn next-btn" onclick="showNextImage()">❯</button>
        <div class="slide-number"></div>
    </div>
</div>

<style>
#slideshow-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    padding: 20px;
}

.frame {
    position: relative;
    padding: 15px;
    background: white;
    box-shadow: 0 0 15px rgba(0,0,0,0.1);
    border-radius: 5px;
}

#slideshow {
    max-width: 600px;
    height: auto;
    display: block;
    border-radius: 2px;
    opacity: 1;
    transition: opacity 0.5s ease-in-out;
}

.nav-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 16px 12px;
    border: none;
    cursor: pointer;
    border-radius: 4px;
    font-size: 18px;
    transition: background 0.3s;
}

.nav-btn:hover {
    background: rgba(0, 0, 0, 0.8);
}

.prev-btn {
    left: 25px;
}

.next-btn {
    right: 25px;
}

.slide-number {
    position: absolute;
    bottom: 25px;
    right: 25px;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
}

#slideshow.fade-out {
    opacity: 0;
}
</style>

<script>
const images = [
    '0.jpg',
    '1.jpg',
    '3.jpg',
    '4.jpg'
    // Add more image paths as needed
];

let currentImageIndex = 0;
const slideshowElement = document.getElementById('slideshow');
const slideNumberElement = document.querySelector('.slide-number');

function updateSlideNumber() {
    slideNumberElement.textContent = `${currentImageIndex + 1} / ${images.length}`;
}

function showImage(index) {
    slideshowElement.classList.add('fade-out');
    
    setTimeout(() => {
        slideshowElement.src = images[index];
        slideshowElement.classList.remove('fade-out');
        updateSlideNumber();
    }, 500);
}

function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % images.length;
    showImage(currentImageIndex);
}

function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
    showImage(currentImageIndex);
}

// Handle keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        showPrevImage();
    } else if (e.key === 'ArrowRight') {
        showNextImage();
    }
});

// Initial load
slideshowElement.src = images[0];
updateSlideNumber();
</script>