#!/bin/bash
set -e

# Set resource limits
ulimit -u 1000
ulimit -t 10
ulimit -v 262144

# Check if running in scratch mode
if [ "$1" = "scratch" ]; then
  cd /app/code
  
  # Compile C++ code - use Main.cpp for scratch mode
  if ! g++ -std=c++17 -O2 -Wall -Wextra -g -o solution Main.cpp 2> error.txt; then
    cat error.txt >&2
    exit 1
  fi
  
  # Run with input.txt
  if [ -f "/app/input.txt" ]; then
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

  cd /app/code

  # Compile C++ code
  if ! g++ -std=c++17 -O2 -Wall -Wextra -g -o solution $CODE_FILE 2> error.txt; then
    cat error.txt >&2
    exit 1
  fi

  # Run the compiled program
  if [ -n "$INPUT_FILE" ] && [ -f "$INPUT_FILE" ]; then
    ./solution < $INPUT_FILE
  else
    ./solution
  fi

  EXIT_CODE=$?
  exit $EXIT_CODE
fi