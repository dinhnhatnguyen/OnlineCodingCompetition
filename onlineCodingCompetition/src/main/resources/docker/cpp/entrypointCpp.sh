#!/bin/bash
set -e

# Set resource limits
ulimit -u 1000
ulimit -t 10
ulimit -v 262144

# Check if running in scratch mode
if [ "$1" = "scratch" ]; then
  # Optional subdirectory name in $2 for isolation
  TARGET_DIR="/app/code"
  if [ -n "$2" ] && [ -d "/app/code/$2" ]; then
    TARGET_DIR="/app/code/$2"
  fi
  cd "$TARGET_DIR"
  
  # Compile C++ code - use Main.cpp for scratch mode
  # Compile all .cpp files so scratch can be named arbitrarily (e.g., solution.cpp)
  if ! g++ -std=c++17 -O2 -Wall -Wextra -g -o solution *.cpp 2> error.txt; then
    cat error.txt >&2
    exit 1
  fi
  
  # Run with input.txt (prefer local directory)
  if [ -f "./input.txt" ]; then
    ./solution < ./input.txt
  elif [ -f "/app/code/input.txt" ]; then
    ./solution < /app/code/input.txt
  elif [ -f "/app/input.txt" ]; then
    ./solution < /app/input.txt
  else
    ./solution
  fi
  
  EXIT_CODE=$?
  exit $EXIT_CODE
else
  # Original behavior for normal mode
  # Get code file from command line parameter
  CODE_FILE=$1
  INPUT_FILE=$2

  # Move into the submission directory containing the code file
  SUBDIR=$(dirname "$CODE_FILE")
  cd "$SUBDIR"

  # Compile C++ code (all sources in this directory to support multi-file submissions)
  if ! g++ -std=c++17 -O2 -Wall -Wextra -g -o solution *.cpp 2> error.txt; then
    cat error.txt >&2
    exit 1
  fi

  # Run the compiled program
  if [ -f "/app/code/input.txt" ]; then
    ./solution < "/app/code/input.txt"
  elif [ -n "$INPUT_FILE" ] && [ -f "$INPUT_FILE" ]; then
    ./solution < "$INPUT_FILE"
  else
    ./solution
  fi

  EXIT_CODE=$?
  exit $EXIT_CODE
fi