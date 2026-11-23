---
title: Template Metaprogramming - qMat(1)
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
date: 2025-02-08 22:25:11
tags: [template]
categories:
- cpp
---

Learn C++ template metaprogramming by building qMat from scratch.

<!-- more -->

# Project Plan

We will start a structured learning plan to build a matrix library using modern C++ template metaprogramming. This project will gradually introduce template concepts while building something practical.

**Tentative 8-Week Learning Plan**
- Week 1: Foundation and Basic Setup
  - Basic template concepts
  - Project structure setup
  - CMake configuration
  - Google Test integration
  - Basic Matrix class template
  - Static assertions
  - Type traits basics

- Week 2: Core Matrix Operations
  - Template parameter deduction
  - SFINAE basics
  - Matrix element access
  - Basic operators (+, -, )
  - Compile-time dimension checking
  - Expression templates introduction

- Week 3: Expression Templates
  - Expression templates deep dive
  - Lazy evaluation
  - Operation chaining
  - Template operator overloading
  - Expression template optimization

- Week 4: Advanced Matrix Operations
  - CRTP (Curiously Recurring Template Pattern)
  - Matrix decomposition
  - Specialized operations for square matrices
  - Compile-time optimizations
  - Policy-based design

- Week 5: Memory Management and Optimization
  - Custom allocators
  - Memory layout optimization
  - Template-based size optimization
  - Static vs dynamic matrices
  - Alignment considerations

- Week 6: Special Matrix Types
  - Template specialization
  - Diagonal matrices
  - Triangular matrices
  - Symmetric matrices
  - Sparse matrix support

- Week 7: Advanced Template Features
  - Variadic templates
  - Parameter pack expansion
  - Fold expressions
  - Constexpr evaluation
  - Type erasure techniques

- Week 8: Advanced Features and Optimization
  - SIMD integration
  - Parallel algorithms
  - Custom iterators
  - Perfect forwarding
  - Move semantics optimization


# Get Started (Week 1)

Let's start by setting up project structure and implementing the basic components.
```
.
├── CMakeLists.txt
├── include
│   └── qmat
│       ├── core
│       │   └── matrix.hpp
│       └── utils
│           └── type_traits.hpp
└── tests
    ├── CMakeLists.txt
    └── unit
        └── week1_matrix_test.cpp
```

Each week, we will have intensive unit testing code to ensure everything we implemented is working correctly. Under `unit` folder, we organize unit testing files by different weeks.

let's implement the basic Matrix class template:
```cpp matrix.hpp
#ifndef QMAT_MATRIX_HPP
#define QMAT_MATRIX_HPP

#include <array>
#include <cassert>
#include "../utils/type_traits.hpp"

namespace qmat {

template<typename T, std::size_t Rows, std::size_t Cols>
class Matrix {
    static_assert(is_arithmetic_v<T>, "Matrix elements must be arithmetic type");
    static_assert(dimension_check<Rows, Cols>::is_valid, "Invalid matrix dimensions");

public:
    // Default constructor - zero initialization
    constexpr Matrix() noexcept : data_{} {}

    // Constructor with initial value
    constexpr explicit Matrix(const T& value) noexcept {
        fill(value);
    }

    // Element access
    constexpr T& operator()(std::size_t i, std::size_t j) {
        assert(i < Rows && j < Cols && "Matrix indices out of bounds");
        return data_[i * Cols + j];
    }

    constexpr const T& operator()(std::size_t i, std::size_t j) const {
        assert(i < Rows && j < Cols && "Matrix indices out of bounds");
        return data_[i * Cols + j];
    }

    // Utility functions
    constexpr void fill(const T& value) {
        data_.fill(value);
    }

    constexpr std::size_t rows() const noexcept { return Rows; }
    constexpr std::size_t cols() const noexcept { return Cols; }
    constexpr std::size_t size() const noexcept { return Rows * Cols; }

private:
    std::array<T, Rows * Cols> data_;
};

} // namespace qmat

#endif // QMAT_MATRIX_HPP 
```
Here, we defined a very basic Matrix data type. The `Matrix<T, Rows, Cols>` class is a statically sized matrix implementation with the following key features:

**Compile-time checks**
- Ensures that the element type `T` is arithmetic (`std::is_arithmetic_v<T>`).
- Validates the dimensions using a `dimension_check<Rows, Cols>` trait.

**Memory-efficient storage**
- Uses `std::array<T, Rows * Cols>` for contiguous memory allocation.

**Basic matrix operations**
- Element access via `operator()(i, j)`, with bounds checking using assert.
- A `fill(value)` function to initialize all elements to a given value.
- Accessor functions for dimensions (`rows()`, `cols()`, `size()`).

Let's create some basic type traits that we can use throughout the project:
```cpp type_traits.cpp
#ifndef QMAT_TYPE_TRAITS_HPP
#define QMAT_TYPE_TRAITS_HPP

#include <type_traits>

namespace qmat {

// Forward declare Matrix template
template<typename T, std::size_t Rows, std::size_t Cols>
class Matrix;

// Check if a type is arithmetic (integral or floating point)
template<typename T>
inline constexpr bool is_arithmetic_v = std::is_arithmetic_v<T>;

// Check if two types are arithmetic and the same
template<typename T, typename U>
inline constexpr bool are_same_arithmetic_v = 
    is_arithmetic_v<T> && is_arithmetic_v<U> && std::is_same_v<T, U>;

// Helper for compile-time dimension checking
template<std::size_t Rows, std::size_t Cols>
struct dimension_check {
    static constexpr bool is_valid = (Rows > 0) && (Cols > 0);
    static_assert(is_valid, "Matrix dimensions must be positive");
};

// Primary template for is_matrix (false case)
template<typename T>
struct is_matrix : std::false_type {};

// Specialization for Matrix class (true case)
template<typename T, std::size_t Rows, std::size_t Cols>
struct is_matrix<Matrix<T, Rows, Cols>> : std::true_type {};

// Helper variable template
template<typename T>
inline constexpr bool is_matrix_v = is_matrix<T>::value;

// Get matrix element type
template<typename T>
struct matrix_value_type {
    using type = void;
};

template<typename T, std::size_t Rows, std::size_t Cols>
struct matrix_value_type<Matrix<T, Rows, Cols>> {
    using type = T;
};

template<typename T>
using matrix_value_type_t = typename matrix_value_type<T>::type;

// Get matrix dimensions
template<typename T>
struct matrix_traits {
    static constexpr std::size_t rows = 0;
    static constexpr std::size_t cols = 0;
};

template<typename T, std::size_t Rows, std::size_t Cols>
struct matrix_traits<Matrix<T, Rows, Cols>> {
    static constexpr std::size_t rows = Rows;
    static constexpr std::size_t cols = Cols;
    using value_type = T;
};

// Check if two matrices have compatible dimensions for addition/subtraction
template<typename M1, typename M2>
struct has_same_dimensions : std::false_type {};

template<typename T1, typename T2, std::size_t Rows, std::size_t Cols>
struct has_same_dimensions<Matrix<T1, Rows, Cols>, Matrix<T2, Rows, Cols>> 
    : std::true_type {};

template<typename M1, typename M2>
inline constexpr bool has_same_dimensions_v = has_same_dimensions<M1, M2>::value;

// Check if two matrices have compatible dimensions for multiplication
template<typename M1, typename M2>
struct can_multiply : std::false_type {};

template<typename T1, typename T2, std::size_t Rows1, std::size_t Cols1, 
         std::size_t Rows2, std::size_t Cols2>
struct can_multiply<Matrix<T1, Rows1, Cols1>, Matrix<T2, Rows2, Cols2>> {
    static constexpr bool value = (Cols1 == Rows2);
};

template<typename M1, typename M2>
inline constexpr bool can_multiply_v = can_multiply<M1, M2>::value;

} // namespace qmat

#endif // QMAT_TYPE_TRAITS_HPP 
```

We need some unit tests to ensure our implementation is correct.
```cpp wee1_matrix_test.cpp
#include <gtest/gtest.h>
#include <qmat/core/matrix.hpp>
#include <qmat/utils/type_traits.hpp>

namespace qmat::test::week1 {

//------------------------------------------------------------------------------
// Week 1: Basic Matrix Tests
//------------------------------------------------------------------------------

// Construction and Basic Properties
TEST(Week1_Matrix, DefaultConstruction) {
    Matrix<int, 2, 3> mat;
    EXPECT_EQ(mat.rows(), 2);
    EXPECT_EQ(mat.cols(), 3);
    EXPECT_EQ(mat.size(), 6);
    
    // Check zero initialization
    for(size_t i = 0; i < mat.rows(); ++i) {
        for(size_t j = 0; j < mat.cols(); ++j) {
            EXPECT_EQ(mat(i, j), 0);
        }
    }
}

TEST(Week1_Matrix, ValueConstruction) {
    Matrix<double, 3, 2> mat(1.5);
    
    for(size_t i = 0; i < mat.rows(); ++i) {
        for(size_t j = 0; j < mat.cols(); ++j) {
            EXPECT_DOUBLE_EQ(mat(i, j), 1.5);
        }
    }
}

TEST(Week1_Matrix, ElementAccess) {
    Matrix<int, 2, 2> mat;
    mat(0, 0) = 1;
    mat(0, 1) = 2;
    mat(1, 0) = 3;
    mat(1, 1) = 4;

    EXPECT_EQ(mat(0, 0), 1);
    EXPECT_EQ(mat(0, 1), 2);
    EXPECT_EQ(mat(1, 0), 3);
    EXPECT_EQ(mat(1, 1), 4);
}

// Type Traits Tests
TEST(Week1_TypeTraits, IsMatrix) {
    using Mat2x2 = Matrix<double, 2, 2>;
    using Mat3x4 = Matrix<int, 3, 4>;
    
    EXPECT_TRUE(is_matrix_v<Mat2x2>);
    EXPECT_TRUE(is_matrix_v<Mat3x4>);
    EXPECT_FALSE(is_matrix_v<int>);
    EXPECT_FALSE(is_matrix_v<double>);
}

TEST(Week1_TypeTraits, MatrixProperties) {
    using Mat2x3 = Matrix<double, 2, 3>;
    using Mat3x2 = Matrix<float, 3, 2>;
    
    EXPECT_EQ((matrix_traits<Mat2x3>::rows), 2);
    EXPECT_EQ((matrix_traits<Mat2x3>::cols), 3);
    EXPECT_TRUE((std::is_same_v<matrix_traits<Mat2x3>::value_type, double>));
    
    EXPECT_EQ((matrix_traits<Mat3x2>::rows), 3);
    EXPECT_EQ((matrix_traits<Mat3x2>::cols), 2);
    EXPECT_TRUE((std::is_same_v<matrix_traits<Mat3x2>::value_type, float>));
}

TEST(Week1_TypeTraits, OperationCompatibility) {
    using Mat2x2d = Matrix<double, 2, 2>;
    using Mat2x2f = Matrix<float, 2, 2>;
    using Mat2x3 = Matrix<double, 2, 3>;
    using Mat3x2 = Matrix<double, 3, 2>;
    
    // Same dimensions
    EXPECT_TRUE((has_same_dimensions_v<Mat2x2d, Mat2x2d>));
    EXPECT_TRUE((has_same_dimensions_v<Mat2x2d, Mat2x2f>));
    EXPECT_FALSE((has_same_dimensions_v<Mat2x2d, Mat2x3>));
    
    // Multiplication compatibility
    EXPECT_TRUE((can_multiply_v<Mat2x3, Mat3x2>));
    EXPECT_FALSE((can_multiply_v<Mat2x3, Mat2x3>));
}

// Compile-time Checks
TEST(Week1_Matrix, CompileTimeChecks) {
    // These should compile
    Matrix<int, 1, 1> mat1;
    Matrix<double, 10, 20> mat2;
    
    // The following lines should not compile (uncomment to test)
    // Matrix<int, 0, 1> mat3;  // Invalid rows
    // Matrix<int, 1, 0> mat4;  // Invalid cols
    // Matrix<std::string, 1, 1> mat5;  // Non-arithmetic type
}

TEST(Week1_Matrix, Fill) {
    Matrix<int, 2, 3> mat;
    mat.fill(42);
    
    for(size_t i = 0; i < mat.rows(); ++i) {
        for(size_t j = 0; j < mat.cols(); ++j) {
            EXPECT_EQ(mat(i, j), 42);
        }
    }
}

// Edge Cases
TEST(Week1_Matrix, SingleElementMatrix) {
    Matrix<double, 1, 1> mat(3.14);
    EXPECT_DOUBLE_EQ(mat(0, 0), 3.14);
    EXPECT_EQ(mat.size(), 1);
    EXPECT_EQ(mat.rows(), 1);
    EXPECT_EQ(mat.cols(), 1);
}

TEST(Week1_Matrix, LargeMatrix) {
    constexpr size_t LARGE_DIM = 1000;
    Matrix<int, LARGE_DIM, LARGE_DIM> mat(1);
    
    EXPECT_EQ(mat.rows(), LARGE_DIM);
    EXPECT_EQ(mat.cols(), LARGE_DIM);
    EXPECT_EQ(mat.size(), LARGE_DIM * LARGE_DIM);
    EXPECT_EQ(mat(0, 0), 1);
    EXPECT_EQ(mat(LARGE_DIM-1, LARGE_DIM-1), 1);
}

} // namespace qmat::test::week1 
```