#!/bin/bash
set -e

# Set resource limits
ulimit -u 1000
ulimit -t 10
ulimit -v 262144

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