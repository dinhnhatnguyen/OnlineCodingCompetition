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

  # Move into the submission directory containing the code file
  SUBDIR=$(dirname "$CODE_FILE")
  BASENAME=$(basename "$CODE_FILE")
  cd "$SUBDIR"

  # Run Python code
  if [ -n "$INPUT_FILE" ] && [ -f "$INPUT_FILE" ]; then
    python3 -u "$BASENAME" < "$INPUT_FILE"
  else
    python3 -u "$BASENAME"
  fi

  EXIT_CODE=$?
  exit $EXIT_CODE
fi