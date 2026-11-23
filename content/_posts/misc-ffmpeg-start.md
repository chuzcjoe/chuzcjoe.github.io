---
title: Cross Compile FFmpeg
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
date: 2025-01-06 10:25:02
tags: [ffmpeg]
categories:
- misc
---

Cross compile FFmpeg on MacOS for Android

<!-- more -->

# 1. Prepare FFmpeg and Android NDK

FFmpeg
```
// 1. Download FFMpeg (4.2.2 for this tutotial)
https://ffmpeg.org/releases/

// 2. unzip
tar -jxvf ffmpeg-4.2.2.tar.bz2

// 3. configure
./configure --disable-x86asm
```

Android NDK
```
https://developer.android.google.cn/ndk/downloads
```

# 2. Build

In the unzipped folder `ffmpeg-4.2.2`, create a new shell script `build_android.sh`.
```bash build_android.sh
#!/bin/sh

# NDK path, android studio has downloaded sdk, inside the sdk folder, there are multiple ndk versions. I am using 26.1.10909125 here.
NDK=~/Library/Android/sdk/ndk/26.1.10909125
# Target OS
ARCH=aarch64
CPU=arm64-v8a
# Android API
API=21
# Output path: /android/arm64-v8a
OUTPUT=$(pwd)/android/$CPU
# NDK toolchain path
TOOLCHAIN=$NDK/toolchains/llvm/prebuilt/darwin-x86_64
SYSROOT_L=$TOOLCHAIN/sysroot/usr/lib/aarch64-linux-android
GCC_L=$NDK/toolchains/aarch64-linux-android-4.9/prebuilt/darwin-x86_64/lib/gcc/aarch64-linux-android/4.9.x

build_arm64() {
    echo "\033[32m Compiling FFmpeg for $CPU \033[0m"
  ./configure \
  --target-os=android \
  --prefix=$OUTPUT \
  --arch=$ARCH \
  --sysroot=$TOOLCHAIN/sysroot \
  --enable-neon  \
  --enable-hwaccels  \
  --enable-gpl   \
  --disable-postproc \
  --disable-debug \
  --enable-small \
  --enable-jni \
  --enable-mediacodec \
  --enable-decoder=h264_mediacodec \
  --enable-static \
  --enable-shared \
  --disable-doc \
  --enable-ffmpeg \
  --disable-ffplay \
  --disable-ffprobe \
  --disable-avdevice \
  --disable-doc \
  --disable-symver \
  --enable-cross-compile \
  --cross-prefix=$TOOLCHAIN/bin/aarch64-linux-android- \
  --cc=$TOOLCHAIN/bin/aarch64-linux-android$API-clang \
  --cxx=$TOOLCHAIN/bin/aarch64-linux-android$API-clang++ \
  --extra-cflags="-fpic -I$OUTPUT/include" \
  --extra-ldflags="-lc -ldl -lm -lz -llog -lgcc -L$OUTPUT/lib"

  make clean all
  make -j8
  make install
  echo "\033[32m The Compilation of FFmpeg for $CPU is completed \033[0m"
}

build_arm64
```

To build
```
chmod +x build_android.sh
./build_android.sh
```

After successful build, we will have needed libs and headers under `android/arm64-v8a`

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/ffmpeg-start/0.png" title="Image 1" width="600px" height="300px">
</p>
<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/ffmpeg-start/1.png" title="Image 2" width="600px" height="300">
</p>

# 3. Test FFmpeg on Android

Build a simple demo in Android studio to test if FFmpeg works.

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/ffmpeg-start/project.png" title="Image 2" width="600px" height="300">
</p>

We place the ffmpeg headers under `cpp/include` and all the libraries under `jniLibs/arm64-v8a`.

Java client code

```java MainActivity.java
public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ((TextView)findViewById(R.id.text_view)).setText(FFmpegPlay.getFFmpegVersion());
    }
}
```

```java FFmpegplay.java
public class FFmpegPlay {
    static {
        System.loadLibrary("ffmpegtest");
    }

    public static String getFFmpegVersion() {
        return nativeGetFFmpegVersion();
    }

    private static native String nativeGetFFmpegVersion();
}
```

Native code
```cpp ffmpegtest.cpp
#include <jni.h>
#include <cstring>
#include "util/log.h"

extern "C" {
#include <libavcodec/version.h>
#include <libavcodec/avcodec.h>
#include <libavformat/version.h>
#include <libavutil/version.h>
#include <libavfilter/version.h>
#include <libswresample/version.h>
#include <libswscale/version.h>
}

extern "C"
JNIEXPORT jstring JNICALL
Java_com_example_ffmpegtest_FFmpegPlay_nativeGetFFmpegVersion(JNIEnv *env, jclass clazz) {
    char strBuffer[1024 * 4] = {0};
    strcat(strBuffer, "libavcodec : ");
    strcat(strBuffer, AV_STRINGIFY(LIBAVCODEC_VERSION));
    strcat(strBuffer, "\nlibavformat : ");
    strcat(strBuffer, AV_STRINGIFY(LIBAVFORMAT_VERSION));
    strcat(strBuffer, "\nlibavutil : ");
    strcat(strBuffer, AV_STRINGIFY(LIBAVUTIL_VERSION));
    strcat(strBuffer, "\nlibavfilter : ");
    strcat(strBuffer, AV_STRINGIFY(LIBAVFILTER_VERSION));
    strcat(strBuffer, "\nlibswresample : ");
    strcat(strBuffer, AV_STRINGIFY(LIBSWRESAMPLE_VERSION));
    strcat(strBuffer, "\nlibswscale : ");
    strcat(strBuffer, AV_STRINGIFY(LIBSWSCALE_VERSION));
    strcat(strBuffer, "\navcodec_configure : \n");
    strcat(strBuffer, avcodec_configuration());
    strcat(strBuffer, "\navcodec_license : ");
    strcat(strBuffer, avcodec_license());
    LOGCATE("GetFFmpegVersion\n%s", strBuffer);
    return env->NewStringUTF(strBuffer);
}
```

```cmake CMakeLists.txt
# Sets the minimum version of CMake required to build the native library.
cmake_minimum_required(VERSION 3.4.1)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=gnu++11")

set(jnilibs ${CMAKE_SOURCE_DIR}/../jniLibs)
set(libname ffmpegtest)

include_directories(
        ${CMAKE_SOURCE_DIR}/include
        ${CMAKE_SOURCE_DIR}/util
)

link_directories(
        ${jnilibs}/${ANDROID_ABI})

file(GLOB src-files
        ${CMAKE_SOURCE_DIR}/*.cpp)

add_library(
        ${libname}
        SHARED
        ${src-files}
)

set(third-party-libs
        avformat
        avcodec
        avfilter
        swresample
        swscale
        avutil
)

set(native-libs
        android
        mediandk
        EGL
        GLESv3
        OpenSLES
        log
        m
        z
)

target_link_libraries(
        ${libname}

        ${log-lib}
        ${third-party-libs}
        ${native-libs}
)
```

Result

<p align="center">
    <img src="https://media.githubusercontent.com/media/chuzcjoe/blog_imgs/refs/heads/master/misc/ffmpeg-start/result.png" title="Image 2" width="300px" height="100">
</p>
