cmake_minimum_required(VERSION 3.20)
project(FrontierRelay VERSION 0.1.0 LANGUAGES CXX)

# C++26 is still exposed as C++2b by the compiler available in the MVP environment.
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(frontier_relay_core
    core/src/model_broker.cpp
    core/src/confidence_engine.cpp
    core/src/vertical_slice.cpp)
target_include_directories(frontier_relay_core PUBLIC core/include)
target_compile_options(frontier_relay_core PRIVATE -Wall -Wextra -Wpedantic -Werror)

add_executable(frontier-relay app/main.cpp)
target_link_libraries(frontier-relay PRIVATE frontier_relay_core)

enable_testing()
add_executable(frontier_relay_tests tests/vertical_slice_tests.cpp)
target_link_libraries(frontier_relay_tests PRIVATE frontier_relay_core)
add_test(NAME vertical_slice COMMAND frontier_relay_tests)

