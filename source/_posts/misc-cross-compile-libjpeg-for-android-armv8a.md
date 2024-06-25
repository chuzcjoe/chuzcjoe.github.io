---
title: Cross Compile libjpeg for Android
author: Joe Chu
date: 2024-06-22 11:34:44
tags: [libjpeg, cross compile, android]
categories:
- misc
---

Host machine: MacOS
Target device: Android armv8a

<!-- more -->

# 1. Cross compile libjpeg

## 1.1 Step 1

Download source code.
```
git clone https://github.com/libjpeg-turbo/libjpeg-turbo.git
```

## 1.2 Download Android NDK

Contains toolchains for cross compilation.

https://developer.android.com/ndk/downloads

## 1.3 Create a bash script for build

Create a `build.sh` at the root directory of the project.
```bash
#!/bin/bash

# Set these variables to suit your needs
NDK_PATH="/Users/zongchengchu/Library/Android/sdk/ndk/25.1.8937393"  # Full path to the NDK directory
TOOLCHAIN="clang"  # "gcc" or "clang". Use "gcc" with NDK r14b and earlier, and "clang" with NDK r17c and later
ANDROID_VERSION="21"  # Minimum version of Android to support. "21" or later is required for a 64-bit build
BUILD_DIR="build"  # Directory where the build will take place
SOURCE_DIR=".."  # Directory containing the source code
ADDITIONAL_CMAKE_FLAGS=""  # Additional CMake flags if any

#rm -rf ${BUILD_DIR}
# Navigate to the build directory
mkdir -p ${BUILD_DIR}
cd ${BUILD_DIR}

# Run CMake to configure the build
cmake -G"Unix Makefiles" \
  -DANDROID_ABI=arm64-v8a \
  -DANDROID_PLATFORM=android-${ANDROID_VERSION} \
  -DANDROID_TOOLCHAIN=${TOOLCHAIN} \
  -DCMAKE_ASM_FLAGS="--target=aarch64-linux-android${ANDROID_VERSION}" \
  -DCMAKE_TOOLCHAIN_FILE=${NDK_PATH}/build/cmake/android.toolchain.cmake \
  ${ADDITIONAL_CMAKE_FLAGS} ..

# Run make to build the project
make
```

## 1.4 Build

Run the following command for build.
```bash
chmod +x build.sh
./build.sh
``` 

You should see the generated files at `./build` folder.

# 2. A simple demo that can run on Android devices

code: https://github.com/chuzcjoe/libjpeg_for_android

## 2.1 Project structure

```
.
├── CMakeLists.txt
├── build.sh
├── imgs
│   └── input.jpg
├── include
│   ├── jconfig.h
│   ├── jmorecfg.h
│   ├── jpeglib.h
│   └── turbojpeg.h
├── lib
│   └── libturbojpeg.a
└── main.cpp
```

You can get all the needed header files from `step 1.4`. The static library is located at `build` folder.

## 2.2 CMakeLists.txt

```cmake
cmake_minimum_required(VERSION 3.10)

# Set Android specific variables
set(ANDROID_ABI arm64-v8a)
set(ANDROID_PLATFORM android-21)
set(ANDROID_TOOLCHAIN clang)
set(CMAKE_TOOLCHAIN_FILE /Users/zongchengchu/Library/Android/sdk/ndk/25.1.8937393/build/cmake/android.toolchain.cmake)

# Set CMake ASM flags
set(CMAKE_ASM_FLAGS "--target=aarch64-linux-android21")

project(MyTurboJPEGProject)

# Set the path to the TurboJPEG include directory and library
set(TURBOJPEG_INCLUDE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/include")
set(TURBOJPEG_LIBRARY "${CMAKE_CURRENT_SOURCE_DIR}/lib/libturbojpeg.a")

# Include the TurboJPEG headers
include_directories(${TURBOJPEG_INCLUDE_DIR})

# Add your executable
add_executable(MyTurboJPEGProject main.cpp)

# Link against the TurboJPEG library
target_link_libraries(MyTurboJPEGProject ${TURBOJPEG_LIBRARY})

```

## 2.3 Build script

```bash
#!/bin/bash

# Define variables
build_dir="build"
device_dir="/data/local/tmp/jpeg_demo"
img_dir="imgs"

# Clean and create build directory
rm -rf "${build_dir}"
mkdir -p "${build_dir}"
cd "${build_dir}" || exit

# Run cmake and make
cmake ..
make

# Go back to the root directory
cd ..

# Prepare the device directory
adb shell "rm -rf ${device_dir}"
adb shell "mkdir -p ${device_dir}"

# Push the executable to the device
adb push "${build_dir}/MyTurboJPEGProject" "${device_dir}"

# Push all images to the device directory
adb push "${img_dir}/." "${device_dir}/"

# Change the permissions of the executable to make it executable
adb shell "chmod +x ${device_dir}/MyTurboJPEGProject"

# Run the executable on the device
adb shell "cd ${device_dir} && ./MyTurboJPEGProject input.jpg save.jpg"

adb pull "${device_dir}/save.jpg" "./"
```

## 2.4 Run on devices

```bash
./build.sh
```

Running the script will enable you to cross-compile the program, and it will automatically transfer the necessary executable and image files to the device directory. After execution, the output image will be saved and retrieved from the device.

The C++ program simply adds brightness to the input image.

<p align="center">
    <img src="sidebyside.png" title="A regular image" width="1000px" height="800px">
</p>