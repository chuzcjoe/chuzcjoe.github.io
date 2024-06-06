---
title: Builder Design Pattern
author: Joe Chu
date: 2024-06-05 13:25:57
tags: [builder, design pattern]
categories:
- cpp
---

Design pattern.

<!-- more -->

# 1. Introduction

The Builder pattern typically consists of the following components:

- **Product**: This is the complex object that needs to be constructed. It contains the actual data and behavior of the object.
- **Builder**: This is an abstract interface or abstract class that defines the steps required to construct the Product object. It declares a set of methods for building different parts or aspects of the Product.
- **Concrete Builders**: These are concrete implementations of the Builder interface or classes that provide the actual implementation for constructing the Product object. Each Concrete Builder constructs the Product differently, depending on the desired representation or configuration.
- **Director**: The Director class is responsible for orchestrating the construction process by calling the appropriate methods on the Builder in the correct order. It knows the sequence of steps required to create the Product object.

<p align="center">
    <img src="builder.png" title="A regular image" width="800px" height="500px">
</p>

# 2. Example

Let's create camera objects using the Builder design pattern.

Different types of cameras, such as DSLRs, phone cameras, 360-degree cameras, etc., have various specifications, but their fundamental functionalities are similar. We can describe their specifications using common terms such as focus, white balance, stabilization, exposure time, and fps.

In this example:

1. The product is a camera.
2. The builder defines the basic camera specifications without providing detailed implementation.
3. The ConcreteBuilder determines the specific specifications each type of camera should have.
4. The Director is responsible for assembling a certain type of camera.

```cpp
#include <iostream>
#include <string>
#include <vector>

// Product
class Camera {
public:
    void showSpecs() const {
        std::cout << "===Camera Specifications===" << '\n';
        std::cout << "Stabilization: " << (hasStabilization ? "Yes" : "No") << '\n';
        std::cout << "FPS: " << fps << '\n';
        std::cout << "White Balance: " << whiteBalance << '\n';
        std::cout << "Auto Focus: " << (hasAutoFocus ? "Yes" : "No") << '\n';
        std::cout << "Aperture: f/" << aperture << '\n';
        std::cout << "Denoise: " << (hasDenoise ? "Yes" : "No") << '\n';
        std::cout << "Sharpening: " << (hasSharpening ? "Yes" : "No") << '\n';
    }

    friend class CameraBuilder;
    friend class CompactCameraBuilder;
    friend class DSLRCameraBuilder;

private:
    bool hasStabilization;
    int fps;
    std::string whiteBalance;
    bool hasAutoFocus;
    double aperture;
    bool hasDenoise;
    bool hasSharpening;

    Camera() : hasStabilization(false), fps(0), hasAutoFocus(false), aperture(0.0), hasDenoise(false), hasSharpening(false) {}
};

// Builder (Abstract Interface)
class CameraBuilder {
public:
    virtual ~CameraBuilder() {}
    virtual void setStabilization() = 0;
    virtual void setFPS() = 0;
    virtual void setWhiteBalance() = 0;
    virtual void setAutoFocus() = 0;
    virtual void setAperture() = 0;
    virtual void setDenoise() = 0;
    virtual void setSharpening() = 0;
    virtual Camera* getResult() const = 0;
};

// Concrete Builders
class CompactCameraBuilder : public CameraBuilder {
public:
    CompactCameraBuilder() {
        camera = new Camera();
    }

    ~CompactCameraBuilder() {
        delete camera;
    }

    void setStabilization() override {
        camera->hasStabilization = true;
    }

    void setFPS() override {
        camera->fps = 30;
    }

    void setWhiteBalance() override {
        camera->whiteBalance = "Auto";
    }

    void setAutoFocus() override {
        camera->hasAutoFocus = true;
    }

    void setAperture() override {
        camera->aperture = 2.8;
    }

    void setDenoise() override {
        camera->hasDenoise = false;
    }

    void setSharpening() override {
        camera->hasSharpening = false;
    }

    Camera* getResult() const override {
        return camera;
    }

private:
    Camera* camera;
};

class DSLRCameraBuilder : public CameraBuilder {
public:
    DSLRCameraBuilder() {
        camera = new Camera();
    }

    ~DSLRCameraBuilder() {
        delete camera;
    }

    void setStabilization() override {
        camera->hasStabilization = true;
    }

    void setFPS() override {
        camera->fps = 60;
    }

    void setWhiteBalance() override {
        camera->whiteBalance = "Manual";
    }

    void setAutoFocus() override {
        camera->hasAutoFocus = true;
    }

    void setAperture() override {
        camera->aperture = 1.8;
    }

    void setDenoise() override {
        camera->hasDenoise = true;
    }

    void setSharpening() override {
        camera->hasSharpening = true;
    }

    Camera* getResult() const override {
        return camera;
    }

private:
    Camera* camera;
};

// Director
class CameraDirector {
public:
    Camera* getCamera(CameraBuilder& builder) {
        builder.setStabilization();
        builder.setFPS();
        builder.setWhiteBalance();
        builder.setAutoFocus();
        builder.setAperture();
        builder.setDenoise();
        builder.setSharpening();
        return builder.getResult();
    }
};

int main() {
    CameraDirector director;

    CompactCameraBuilder compactBuilder;
    auto compactCamera = director.getCamera(compactBuilder);
    std::cout << "Compact Camera:" << '\n';
    compactCamera->showSpecs();
    std::cout << '\n';

    DSLRCameraBuilder dslrBuilder;
    auto dslrCamera = director.getCamera(dslrBuilder);
    std::cout << "DSLR Camera:" << '\n';
    dslrCamera->showSpecs();

    return 0;
}
```

```
Compact Camera:
===Camera Specifications===
Stabilization: Yes
FPS: 30
White Balance: Auto
Auto Focus: Yes
Aperture: f/2.8
Denoise: No
Sharpening: No

DSLR Camera:
===Camera Specifications===
Stabilization: Yes
FPS: 60
White Balance: Manual
Auto Focus: Yes
Aperture: f/1.8
Denoise: Yes
Sharpening: Yes
```