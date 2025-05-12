#!/bin/bash
set -e

ulimit -u 1000
ulimit -t 10
ulimit -v 262144

CODE_FILE=$1
INPUT_FILE=$2

cd /app/code

NODE_OPTS=${NODE_OPTS:-"--max-old-space-size=128"}
if [ -n "$INPUT_FILE" ] && [ -f "$INPUT_FILE" ]; then
    node $NODE_OPTS $CODE_FILE < $INPUT_FILE
else
    node $NODE_OPTS $CODE_FILE
fi

EXIT_CODE=$?
exit $EXIT_CODE