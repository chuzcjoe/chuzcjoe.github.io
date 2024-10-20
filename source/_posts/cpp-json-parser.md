---
title: Implement a JSON Parser
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
  - position: left
    type: categories
date: 2024-10-06 20:21:39
tags: [json parser]
categories:
- cpp
---

C++ JSON Parser.

<!-- more -->

To parse a JSON file without using any third-party libraries in C++, we need to manually process the JSON structure. This involves reading the file, extracting key-value pairs, and handling various data types like strings, numbers, arrays, and objects.

Below is a header-only implementation of the JSON parser.
```c++
// jsonParser.h
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <stdexcept>

class JSONValue;

using JSONObject = std::map<std::string, JSONValue>;
using JSONArray = std::vector<JSONValue>;

class JSONValue {
public:
    enum Type { Null, Boolean, Number, String, Array, Object };

    JSONValue() : type(Null) {}
    JSONValue(bool b) : type(Boolean), boolean(b) {}
    JSONValue(double n) : type(Number), number(n) {}
    JSONValue(const std::string& s) : type(String), str(s) {}
    JSONValue(const JSONArray& a) : type(Array), array(a) {}
    JSONValue(const JSONObject& o) : type(Object), object(o) {}

    Type getType() const { return type; }
    bool isNull() const { return type == Null; }
    bool isBoolean() const { return type == Boolean; }
    bool isNumber() const { return type == Number; }
    bool isString() const { return type == String; }
    bool isArray() const { return type == Array; }
    bool isObject() const { return type == Object; }

    bool asBoolean() const { return boolean; }
    double asNumber() const { return number; }
    const std::string& asString() const { return str; }
    const JSONArray& asArray() const { return array; }
    const JSONObject& asObject() const { return object; }

private:
    Type type;
    bool boolean;
    double number;
    std::string str;
    JSONArray array;
    JSONObject object;
};

class JSONParser {
public:
    static JSONValue parse(const std::string& json) {
        size_t index = 0;
        return parseValue(json, index);
    }

private:
    static JSONValue parseValue(const std::string& json, size_t& index) {
        skipWhitespace(json, index);
        
        if (index >= json.length()) {
            throw std::runtime_error("Unexpected end of input");
        }

        char c = json[index];
        if (c == '{') {
            return parseObject(json, index);
        } else if (c == '[') {
            return parseArray(json, index);
        } else if (c == '"') {
            return parseString(json, index);
        } else if (c == 't' || c == 'f') {
            return parseBoolean(json, index);
        } else if (c == 'n') {
            return parseNull(json, index);
        } else if (c == '-' || (c >= '0' && c <= '9')) {
            return parseNumber(json, index);
        }

        throw std::runtime_error("Unexpected character");
    }

    static JSONObject parseObject(const std::string& json, size_t& index) {
        JSONObject obj;
        index++; // Skip '{'

        while (index < json.length()) {
            skipWhitespace(json, index);
            if (json[index] == '}') {
                index++;
                return obj;
            }

            std::string key = parseString(json, index).asString();
            skipWhitespace(json, index);

            if (index >= json.length() || json[index] != ':') {
                throw std::runtime_error("Expected ':' after key in object");
            }
            index++; // Skip ':'

            JSONValue value = parseValue(json, index);
            obj[key] = value;

            skipWhitespace(json, index);
            if (index < json.length() && json[index] == ',') {
                index++;
            }
        }

        throw std::runtime_error("Unterminated object");
    }

    static JSONArray parseArray(const std::string& json, size_t& index) {
        JSONArray arr;
        index++; // Skip '['

        while (index < json.length()) {
            skipWhitespace(json, index);
            if (json[index] == ']') {
                index++;
                return arr;
            }

            arr.push_back(parseValue(json, index));

            skipWhitespace(json, index);
            if (index < json.length() && json[index] == ',') {
                index++;
            }
        }

        throw std::runtime_error("Unterminated array");
    }

    static JSONValue parseString(const std::string& json, size_t& index) {
        std::string result;
        index++; // Skip opening quote

        while (index < json.length()) {
            char c = json[index++];
            if (c == '"') {
                return JSONValue(result);
            } else if (c == '\\') {
                if (index >= json.length()) {
                    throw std::runtime_error("Unterminated string");
                }
                c = json[index++];
                switch (c) {
                    case '"': case '\\': case '/': result += c; break;
                    case 'b': result += '\b'; break;
                    case 'f': result += '\f'; break;
                    case 'n': result += '\n'; break;
                    case 'r': result += '\r'; break;
                    case 't': result += '\t'; break;
                    default: throw std::runtime_error("Invalid escape sequence");
                }
            } else {
                result += c;
            }
        }

        throw std::runtime_error("Unterminated string");
    }

    static JSONValue parseNumber(const std::string& json, size_t& index) {
        size_t start = index;
        while (index < json.length() && 
               (json[index] == '-' || json[index] == '+' || json[index] == '.' || 
                (json[index] >= '0' && json[index] <= '9') || 
                json[index] == 'e' || json[index] == 'E')) {
            index++;
        }
        std::string numStr = json.substr(start, index - start);
        return JSONValue(std::stod(numStr));
    }

    static JSONValue parseBoolean(const std::string& json, size_t& index) {
        if (json.substr(index, 4) == "true") {
            index += 4;
            return JSONValue(true);
        } else if (json.substr(index, 5) == "false") {
            index += 5;
            return JSONValue(false);
        }
        throw std::runtime_error("Invalid boolean value");
    }

    static JSONValue parseNull(const std::string& json, size_t& index) {
        if (json.substr(index, 4) == "null") {
            index += 4;
            return JSONValue();
        }
        throw std::runtime_error("Invalid null value");
    }

    static void skipWhitespace(const std::string& json, size_t& index) {
        while (index < json.length() && (json[index] == ' ' || json[index] == '\t' || json[index] == '\n' || json[index] == '\r')) {
            index++;
        }
    }
};
```

To test it, we prepare a simple JSON file as:
```json
{
  "name": "John Doe",
  "age": 30,
  "hobbies": ["reading", "cycling", "photography"],
  "address": {
    "street": "123 Main St",
    "city": "Anytown"
  }
}
```

We have a simple test script to read the JSON content.
```c++
// test.cpp
#include "jsonParser.h"

int main() {
    try {
        // Read JSON file
        std::ifstream file("data.json");
        std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());

        // Parse JSON
        JSONValue data = JSONParser::parse(content);

        // Access and print some data
        const JSONObject& obj = data.asObject();
        std::cout << "Name: " << obj.at("name").asString() << std::endl;
        std::cout << "Age: " << obj.at("age").asNumber() << std::endl;

        // Iterate through an array
        std::cout << "Hobbies:" << std::endl;
        for (const auto& hobby : obj.at("hobbies").asArray()) {
            std::cout << "- " << hobby.asString() << std::endl;
        }

        // Access nested objects
        const JSONObject& address = obj.at("address").asObject();
        std::cout << "Address:" << std::endl;
        std::cout << "  Street: " << address.at("street").asString() << std::endl;
        std::cout << "  City: " << address.at("city").asString() << std::endl;

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }

    return 0;
}
```

To compile and run.
```
g++ test.cpp -o test -std=c++11
./test

Name: John Doe
Age: 30
Hobbies:
- reading
- cycling
- photography
Address:
  Street: 123 Main St
  City: Anytown
```