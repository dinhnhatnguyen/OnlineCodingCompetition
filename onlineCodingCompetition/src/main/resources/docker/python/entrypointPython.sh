#!/bin/bash
set -e

# Set resource limits
ulimit -u 1000
ulimit -t 10
ulimit -v 262144

# Check if running in scratch mode
if [ "$1" = "scratch" ]; then
  cd /app/code
  
  # Run Python code with input.txt
  if [ -f "/app/input.txt" ]; then
    python3 -u solution.py < /app/input.txt
  else
    python3 -u solution.py
  fi
  
  EXIT_CODE=$?
  exit $EXIT_CODE
else
  # Original behavior for normal mode
  # Get file name from command line parameters
  CODE_FILE=$1
  INPUT_FILE=$2

  cd /app/code

  # Run Python code
  if [ -n "$INPUT_FILE" ] && [ -f "$INPUT_FILE" ]; then
    python3 -u $CODE_FILE < $INPUT_FILE
  else
    python3 -u $CODE_FILE
  fi

  EXIT_CODE=$?
  exit $EXIT_CODE
fi