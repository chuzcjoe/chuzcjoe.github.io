---
title: Lambda expression
author: Joe Chu
date: 2023-11-09 11:49:09
tags: [cpp]
categories:
- cpp
---

An introduction of Lambda expression in C++

<!-- more -->

Lambda expression is introduced in C++11. The purpose is to use a function without explicitly defining a function.

## Syntax
```
[ capture clause ] (parameters) -> return-type  
{   
   definition of method   
};
```

## example 1
```c++
int main() { 
    std::vector<int> vec = {8, 3, 10, 1, 2}; 
    
    // sort in descending order
    std::sort(vec.begin(), vec.end(), [](const auto& a, const auto& b){
        return a >= b;
    });
    
    for (const auto& num : vec) {
        std::cout << num << " \n"; 
    }
}

// output
// 10 8 3 2 1
```

## example 2
Lambda expression can access external variables by []. There are 3 ways to capture variables.
- [&]: capture all external variables by **reference**.
- [=]: capture all external variables by **value**.
- [a, &b]: capture a by **value** and b by **reference**.
- []: an empty [] can access local variables.

```c++
int main() { 
    std::vector<int> vec = {8, 3, 10, 1, 2}; 
    
    // access vec by reference
    auto print1 = [&]() {
        for (const auto v : vec)
            std::cout << v << " ";
    };
    
    print1(); // 8 3 10 1 2
    std::cout << "\n";
    
    // access vec by value
    auto print2 = [vec]() {
        for (const auto v : vec)
            std::cout << v << " ";
    };
    
    print2(); // 8 3 10 1 2
    std::cout << "\n";
    
    int N = 5;
    // access N by value
    vector<int>:: iterator p = find_if(vec.begin(), vec.end(), [&N](const auto& num)
    {
        return num > N;
    });
    
    std::cout << "first value greater than " << N << ": " << *p <<  std::endl; // first value greater than 5: 8
}
```

## example 3
Pass lambda expressions to a function.

```c++
int performOperation(int x, int y, std::function<int(int, int)> op) {
    return op(x, y);
}

int main() { 
    auto add = [](int x, int y) -> int {
        return x+y;
    };
    
    auto multiply = [](int x, int y) -> int {
        return x*y;
    };
    
    // pass lambda expression as function parameter
    int result1 = performOperation(5, 3, add);
    int result2 = performOperation(5, 3, multiply);

    std::cout << "Result of addition: " << result1 << std::endl; // Result of addition: 8
    std::cout << "Result of multiplication: " << result2 << std::endl; // Result of multiplication: 15
}
```

## example 4
Use lambda expression in a class.
```c++
class Calculator {
public:
    // Constructor
    Calculator() {
        // Define lambda expressions for different operations
        add = [](int x, int y) -> int { return x + y; };
        subtract = [](int x, int y) -> int { return x - y; };
        multiply = [](int x, int y) -> int { return x * y; };
        divide = [](int x, int y) -> int {
            if (y != 0) {
                return x / y;
            } else {
                std::cerr << "Error: Division by zero!" << std::endl;
                return 0;
            }
        };
    }

    // Perform addition using the add lambda expression
    int performAddition(int a, int b) {
        return add(a, b);
    }

    // Perform subtraction using the subtract lambda expression
    int performSubtraction(int a, int b) {
        return subtract(a, b);
    }

    // Perform multiplication using the multiply lambda expression
    int performMultiplication(int a, int b) {
        return multiply(a, b);
    }

    // Perform division using the divide lambda expression
    int performDivision(int a, int b) {
        return divide(a, b);
    }

private:
    // Lambda expressions for different operations
    std::function<int(int, int)> add;
    std::function<int(int, int)> subtract;
    std::function<int(int, int)> multiply;
    std::function<int(int, int)> divide;
};

int main() {
    Calculator calculator;

    int a = 10;
    int b = 5;

    std::cout << "Addition: " << calculator.performAddition(a, b) << std::endl; // Addition: 15
    std::cout << "Subtraction: " << calculator.performSubtraction(a, b) << std::endl; // Subtraction: 5
    std::cout << "Multiplication: " << calculator.performMultiplication(a, b) << std::endl; // Multiplication: 50
    std::cout << "Division: " << calculator.performDivision(a, b) << std::endl; // Division: 2

    return 0;
}
```

## References
- https://www.geeksforgeeks.org/lambda-expression-in-c/
- https://learn.microsoft.com/en-us/cpp/cpp/lambda-expressions-in-cpp?view=msvc-170


