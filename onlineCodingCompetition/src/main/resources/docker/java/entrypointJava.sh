#!/bin/bash
set -e

# Check if running in scratch mode
if [ "$1" = "scratch" ]; then
  cd /app/code
  
  # Compile Solution.java file
  javac -d . Solution.java
  
  # Run with increased memory limit for scratch mode
  if [ -f "/app/input.txt" ]; then
    java -Xmx256m -Xss8m Solution < /app/input.txt
  else
    java -Xmx256m -Xss8m Solution
  fi
  
  EXIT_CODE=$?
  exit $EXIT_CODE
else
  # Original behavior for normal mode
  # Lấy tên file từ tham số dòng lệnh
  CODE_FILE=$1
  INPUT_FILE=$2

  cd /app/code

  # Biên dịch file mã nguồn
  javac -d . "$CODE_FILE"
  MAIN_CLASS=$(basename "$CODE_FILE" .java)

  # Chạy mã nguồn Java với giới hạn bộ nhớ và stack
  if [ -n "$INPUT_FILE" ] && [ -f "$INPUT_FILE" ]; then
    # Run with input file
    java -Xmx128m -Xss8m "$MAIN_CLASS" < "$INPUT_FILE" > output.txt 2> error.txt
  else
    # Run without input file
    java -Xmx128m -Xss8m "$MAIN_CLASS" > output.txt 2> error.txt
  fi

  # Trả về exit code từ lệnh Java
  EXIT_CODE=$?
  cat output.txt
  cat error.txt >&2
  exit $EXIT_CODE
fi