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

  # Di chuyển vào thư mục chứa mã nguồn (thư mục submission-...)
  SUBDIR=$(dirname "$CODE_FILE")
  cd "$SUBDIR"

  # Xác định tên main class từ tên file
  MAIN_CLASS=$(basename "$CODE_FILE" .java)

  # Biên dịch tất cả các file .java trong cùng thư mục để đảm bảo Solution.java được biên dịch
  javac -d . *.java

  # Chạy mã nguồn Java với giới hạn bộ nhớ và stack
  if [ -n "$INPUT_FILE" ] && [ -f "$INPUT_FILE" ]; then
    # Run with input file (sử dụng đường dẫn tuyệt đối hoặc tương đối đều được)
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