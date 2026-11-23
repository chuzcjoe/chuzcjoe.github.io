---
title: Display Correct Aspect Ratio of Camera Preview in Android
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
date: 2025-04-13 22:16:30
tags: [android, camera]
categories:
- misc
---

In this post, we’ll dive into the key concepts and techniques for adjusting the size of a SurfaceView to match the camera preview’s aspect ratio and ensure a distortion-free display.

<!-- more -->

# 1. Orientation(s)

Before we get into the details, it’s important to first understand how orientation works in Android and how it affects camera previews.

## 1.1 Display Orientation

Display orientation describes the current rotation of the device screen. To obtain the orientation, we could use `WindowManager`.
```java
WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
int rotation = windowManager.getDefaultDisplay().getRotation();
```

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/display-camera-preview/display-orientation.png" title="Image 1" width="600px" height="600px">
</p>

## 1.2 Camera Sensor Orientation

Camera sensor orientation refers to the angle between the physical orientation of the camera sensor and the device’s natural (unrotated) display orientation. This value is a **fixed** property of the camera hardware, and you can retrieve it like this:

```java
CameraManager manager = (CameraManager) context.getSystemService(Context.CAMERA_SERVICE);
CameraCharacteristics characteristics = manager.getCameraCharacteristics(cameraId);
int sensorOrientation = characteristics.get(CameraCharacteristics.SENSOR_ORIENTATION);
```

On most smartphones, the sensor orientation is `90` degrees. The image below illustrates what this actually means. Since the sensor is rotated `90` degrees relative to the screen, any image it captures will also be rotated accordingly.

When previewing with something like a SurfaceView, the **Camera2 API** compensates for this rotation automatically to ensure the image looks correct to the user. However, it does this by swapping the width and height of the preview buffer, which can lead to visual distortions—especially when the `SurfaceView's` aspect ratio doesn't match the camera preview’s.

This automatic scaling often results in vertically stretched or squashed images, as shown below:

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/display-camera-preview/camera-sensor-orientation.png" title="Image 1" width="700px" height="600px">
</p>

# 2. Root Cause of Distortion

Let's assume the image we capture from the image sensor is `1920x1080`. The **root cause** of this problem is that the image size mismatches the `SurfaceView` size (`1080x2308`).

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/display-camera-preview/rootcause1.png" title="Image 1" width="700px" height="600px">
</p>

In Android, a `SurfaceView` is a special kind of View that provides a dedicated drawing surface embedded inside the view hierarchy. However, it's a bit unique compared to regular views because it has a separate `Surface` that is managed independently by the window manager. By default, The `Surface` matches the size of the `SurfaceView` after layout is complete.

However, `Surface` can also have its own size. If the `Surface` buffer size is larger or smaller than the `SurfaceView`, scaling or clipping may occur.

Let's rephrase the **root cause** in the context of `SurfaceView` and its associated `Surface`. By default, `Surface` has the same size as `SurfaceView`. And if we set `SurfaceView` to match the parent, then `SurfaceView` is determiend by its parent. For example:

```xml
<FrameLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <com.example.camera.SurfaceView
        android:id="@+id/surfaceView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

</FrameLayout>
```

Camera stream outputs images with size of `1920x1080` and renders to `Surface`'s buffer. Since the buffer size is `1080x2308`, the image will be resized at this stage. The buffer is then drawed on the `View` for display. 

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/display-camera-preview/workflow.png" title="Image 1" width="700px" height="600px">
</p>

# 3. Solution

There are several ways to address this issue. In this post, I’ll present a simple and effective approach: **center-crop**. The core idea is to properly adjust the Surface buffer size and the View dimensions.

- Setting the correct` Surface` buffer size ensures the received image isn’t resized or distorted.
- Configuring the appropriate `View` size ensures the image is displayed with the correct aspect ratio.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/display-camera-preview/newworkflow.png" title="Image 1" width="800px" height="600px">
</p>

In order to display the original image with correct aspect ratio `1080/1920=0.5625`, we fix `Surface` buffer size to be the same as image size. We also adjsut the `View` dimension to achieve the same aspect ratio. Here, we have two choices: either keep the short side or the long side. Keeping the short side will make the `View` smaller and leaving black space vertically. Keeping the long side will still fill up the entire screen but the preview is cropped at two sides.

We need a customized `SurfaceView` class.
```java
/**
 * A SurfaceView that can be adjusted to a specified aspect ratio and
 * handles proper scaling to fit the aspect ratio while filling the screen.
 */
public class CustomSurfaceView extends SurfaceView {
    private static final String TAG = CustomSurfaceView.class.getSimpleName();
    private float aspectRatio = 0f;

    public CustomSurfaceView(Context context) {
        super(context, null);
    }

    public CustomSurfaceView(Context context, AttributeSet attrs) {
        super(context, attrs, 0);
    }

    public CustomSurfaceView(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
    }

    /**
     * Sets the aspect ratio for this view. The size of the view will be
     * measured based on the ratio calculated from the parameters.
     *
     * @param width  Camera resolution horizontal size
     * @param height Camera resolution vertical size
     */
    public void setAspectRatio(int width, int height) {
        if (width <= 0 || height <= 0) {
            throw new IllegalArgumentException("Size cannot be negative");
        }
        aspectRatio = (float) width / height;
        getHolder().setFixedSize(width, height); // Fix Surface buffer size
        requestLayout();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        int width = MeasureSpec.getSize(widthMeasureSpec);
        int height = MeasureSpec.getSize(heightMeasureSpec);

        if (aspectRatio == 0f) {
            setMeasuredDimension(width, height);
        } else {
            float actualRatio = (width > height) ? aspectRatio : (1f / aspectRatio);
            int newWidth;
            int newHeight;

            if (width < height * actualRatio) {
                newHeight = height;
                newWidth = Math.round(height * actualRatio);
            } else {
                newWidth = width;
                newHeight = Math.round(width / actualRatio);
            }

            Log.d(TAG, "Measured dimensions set: " + newWidth + " x " + newHeight);
            setMeasuredDimension(newWidth, newHeight);
        }
    }
} 
```