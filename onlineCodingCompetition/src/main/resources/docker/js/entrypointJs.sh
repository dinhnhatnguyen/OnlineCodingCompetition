#!/bin/bash
set -e

ulimit -u 1000
ulimit -t 10
ulimit -v 262144

# Check if running in scratch mode
if [ "$1" = "scratch" ]; then
  cd /app/code
  
  # Increase memory limit for Node.js
  NODE_OPTS=${NODE_OPTS:-"--max-old-space-size=256"}
  
  if [ -f "/app/input.txt" ]; then
    node $NODE_OPTS solution.js < /app/input.txt
  else
    node $NODE_OPTS solution.js
  fi
  
  EXIT_CODE=$?
  exit $EXIT_CODE
else
  # Original behavior for normal mode
  CODE_FILE=$1
  INPUT_FILE=$2

  cd /app/code

  # Increase memory limit for Node.js
  NODE_OPTS=${NODE_OPTS:-"--max-old-space-size=256"}
  
  if [ -n "$INPUT_FILE" ] && [ -f "$INPUT_FILE" ]; then
    node $NODE_OPTS $CODE_FILE < $INPUT_FILE
  else
    node $NODE_OPTS $CODE_FILE
  fi

  EXIT_CODE=$?
  exit $EXIT_CODE
fi