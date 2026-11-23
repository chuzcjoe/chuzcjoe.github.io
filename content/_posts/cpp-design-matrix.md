---
title: Design Matrix
author: Joe Chu
date: 2023-12-15 21:51:30
tags: [ood]
categories:
- cpp
---

Design a customized Matrix.

<!-- more -->

# Introduction

Today, we will explore how to design a customized Matrix class. Matrix is widely used in image processing and scientific computation as data holder. A Matrix data type should have the following attributes and functions:

- size: height and width
- data type: int, float, double
- addition: +
- subtraction: -
- multiplication: *
- scalar multiplication: *
- transpose

# Code

**Mat.h**
```c++
#pragma once
#include <iostream>
#include <initializer_list>

template <typename T>
class Mat {
public:
    static Mat zeros(int rows, int cols) {
        Mat mat(rows, cols);
        return mat;
    }

    static Mat ones(int rows, int cols) {
        Mat mat(rows, cols);
        mat.fill(static_cast<T>(1));
        return mat;
    }
public:
    constexpr Mat() : _row(0), _col(0) {}

    constexpr Mat(const int row, const int col) : _row(row), _col(col) {
        if (_row > 0 && _col > 0) {
            _totalElements = _row * _col;
            _data = (T*) ::operator new(_totalElements * sizeof(T));
        } else {
            std::cerr << "_row > 0 && _col > 0" << std::endl;
            _row = 0;
            _col = 0;
            _data = nullptr;
        }
    }

    constexpr Mat(const Mat& other) {
        *this = other;
    }

    ~Mat() {
        for (size_t i = 0; i < _totalElements; i++) {
            _data[i].~T();
        }

        ::operator delete(_data, _totalElements * sizeof(T));
    }

    const T* operator[](int row) const {
        return _data + row * _col;
    }

    Mat& operator=(std::initializer_list<T> values) {
        _data = (T*) ::operator new(_totalElements * sizeof(T));
        std::copy(values.begin(), values.end(), _data);
        return *this;
    }

    bool operator==(const Mat& other) {
        if (_data == other._data && _row == other._row && _col == other._col) return true;
        else return false;
    }

    Mat& operator=(const Mat& other) {

        if (*this == other) return *this;

        _row = other._row;
        _col = other._col;

        if (_row == other._row && _col == other._col && (_row > 0 && _col > 0)) {
            _totalElements = _row * _col;
            _data = (T*) ::operator new(_totalElements * sizeof(T));
            for (size_t i = 0; i < _row; i++) {
                for (size_t j = 0; j < _col; j++) {
                    auto idx = _index(i, j, _col);
                    _data[idx] = other._data[idx];
                }
            }
            return *this;
        } else {
             throw std::invalid_argument("matrix size must be the same.");
        }
    }

    Mat operator+(const Mat& other) {
        if (other._row == _row && other._col == _col) {
            Mat<T> res = *this;
            for (size_t i = 0; i < _row; i++) {
                for (size_t j = 0; j < _col; j++) {
                    auto idx = _index(i, j, _col);
                    res._data[idx] = _data[idx] + other._data[idx];
                }
            }
            return res;
        } else {
            throw std::invalid_argument("matrix size must be the same.");
        }
    }

    Mat operator-(const Mat& other) {
        if (other._row == _row && other._col == _col) {
            Mat<T> res = *this;
            for (size_t i = 0; i < _row; i++) {
                for (size_t j = 0; j < _col; j++) {
                    auto idx = _index(i, j, _col);
                    res._data[idx] = _data[idx] - other._data[idx];
                }
            }
            return res;
        } else {
            throw std::invalid_argument("matrix size must be the same.");
        }
    }

    Mat operator*(const Mat& other) {
        if (other._row == _row && other._col == _col) {
            Mat<T> res = *this;
            for (size_t i = 0; i < _row; i++) {
                for (size_t j = 0; j < _col; j++) {
                    auto idx = _index(i, j, _col);
                    res._data[idx] = _data[idx] * other._data[idx];
                }
            }
            return res;
        } else {
            throw std::invalid_argument("matrix size must be the same.");
        }
    }

    Mat& operator*(T scalar) {
        for (size_t i = 0; i < _row; i++) {
            for (size_t j = 0; j < _col; j++) {
                auto idx = _index(i, j, _col);
                _data[idx] *= scalar;
            }
        }
        return *this;
    }

    Mat& fill(T scalar) {
        for (size_t i = 0; i < _row; i++) {
            for (size_t j = 0; j < _col; j++) {
                auto idx = _index(i, j, _col);
                _data[idx] = scalar;
            }
        }
        return *this;
    }

    Mat transpose() {
        Mat<T> res(_col, _row);
        for (size_t i = 0; i < _row; i++) {
            for (size_t j = 0; j < _col; j++) {
                auto idx1 = _index(i, j, _col);
                auto idx2 = _index(j, i, _row);
                res._data[idx2] = _data[idx1];
            }
        }

        return res;
    }

    constexpr int rows() const {
        return _row;
    }

    constexpr int cols() const {
        return _col;
    }

private:
    constexpr int _index(int i, int j, int stride) const {
        return i * stride + j;
    }

private:
    int _row;
    int _col;
    int _totalElements;
    T* _data;
};
```

**main.cpp**
```c++
#include "Mat.h"
#include <iostream>
#include <memory>
#include <cstring>
#include <string>
#include <vector>

template <typename T>
void printMat(const Mat<T>& mat, const std::string& name) {
    std::cout << "-----------> " << name << std::endl;
    for (int i = 0; i < mat.rows(); i++) {
        for (int j = 0; j < mat.cols(); j++) {
            if (i == 0 && j == 0) std::cout << "[ ";
            std::cout << mat[i][j] << ", ";
            if (i == mat.rows() - 1 && j == mat.cols() - 1) std::cout << "]\n";
            if (j == mat.cols() - 1) std::cout << "\n";
        }
    }
}

int main() {
    Mat<float> mat1(3, 3);
    mat1 = {1, 2, 3,
            4, 5, 6,
            7, 8, 9};

    printMat(mat1, "mat1");

    Mat<float> mat2(3, 3);
    mat2 = {1, 1, 1,
            1, 1, 1,
            1, 1, 2};

    Mat<float> mat3 = mat2;
    printMat(mat3, "mat3");

    Mat<float> mat4 = mat1 + mat2;
    printMat(mat4, "mat4");

    Mat<float> mat5 = mat1 - mat2;
    printMat(mat5, "mat5");

    Mat<float> mat6 = mat1 * mat2;
    printMat(mat6, "mat6");

    Mat<float> mat7(2, 3);
    mat7 = {1, 2, 3,
            4, 5, 6};
    printMat(mat7, "mat7");
    Mat<float> mat7Trans = mat7.transpose();
    printMat(mat7Trans, "mat7Trans");

    Mat<float> mat8(3, 3);
    mat8 = {1, 2, 3,
            4, 5, 6,
            7, 8, 9};
    printMat(mat8, "mat8");
    mat8 = mat8 * 2.0f;
    printMat(mat8, "mat8");

    Mat<float> mat9 = Mat<float>::zeros(3, 3);
    printMat(mat9, "mat9");

    Mat<float> mat10 = Mat<float>::ones(3, 3);
    printMat(mat10, "mat10");
    
    return 0;
}
```

```
output:
-----------> mat1
[ 1, 2, 3, 
4, 5, 6, 
7, 8, 9, ]

-----------> mat3
[ 1, 1, 1, 
1, 1, 1, 
1, 1, 2, ]

-----------> mat4
[ 2, 3, 4, 
5, 6, 7, 
8, 9, 11, ]

-----------> mat5
[ 0, 1, 2, 
3, 4, 5, 
6, 7, 7, ]

-----------> mat6
[ 1, 2, 3, 
4, 5, 6, 
7, 8, 18, ]

-----------> mat7
[ 1, 2, 3, 
4, 5, 6, ]

-----------> mat7Trans
[ 1, 4, 
2, 5, 
3, 6, ]

-----------> mat8
[ 1, 2, 3, 
4, 5, 6, 
7, 8, 9, ]

-----------> mat8
[ 2, 4, 6, 
8, 10, 12, 
14, 16, 18, ]

-----------> mat9
[ 0, 0, 0, 
0, 0, 0, 
0, 0, 0, ]

-----------> mat10
[ 1, 1, 1, 
1, 1, 1, 
1, 1, 1, ]
```