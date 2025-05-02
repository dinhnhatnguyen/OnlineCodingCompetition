#!/bin/bash
set -e

# Get code file from command line parameter
CODE_FILE=$1

cd /app/code

# Compile C++ code
#echo "Compiling C++ code..."
g++ -std=c++17 -o solution $CODE_FILE

# Run the compiled program
#echo "Running C++ code..."
./solution > output.txt 2> error.txt

# Return exit code from execution
EXIT_CODE=$?
cat output.txt
cat error.txt >&2
exit $EXIT_CODE