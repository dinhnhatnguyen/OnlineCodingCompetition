#!/bin/bash
set -e

# Set resource limits
ulimit -u 1000
ulimit -t 10
ulimit -v 262144

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