#!/bin/bash
set -e

# Lấy tên file từ tham số dòng lệnh
CODE_FILE=$1

cd /app/code

# Biên dịch mã nguồn Java
#echo "Compiling Java code..."
javac -d . $CODE_FILE


## gán class name
CLASS_NAME=$(basename "$CODE_FILE" .java)

# Chạy mã nguồn Java với giới hạn bộ nhớ và stack
#echo "Running Java code..."
#java -Xmx128m -Xss8m Solution > output.txt 2> error.txt
java -Xmx128m -Xss8m $CLASS_NAME > output.txt 2> error.txt

# Trả về exit code từ lệnh Java
EXIT_CODE=$?
cat output.txt
cat error.txt >&2
exit $EXIT_CODE





##!/bin/bash

#set -e
#
## Lấy tên file và file test cases từ tham số dòng lệnh
#CODE_FILE=$1
## TEST_CASES_FILE=$2
#
#cd /app/code
#
## Biên dịch mã nguồn Java
#echo "Compiling Java code..."
#javac -d . $CODE_FILE
#
## Chạy mã nguồn Java với giới hạn bộ nhớ và stack
#echo "Running Java code..."
#java -Xmx128m -Xss8m Solution < $TEST_CASES_FILE > output.txt 2> error.txt
#
## Trả về exit code từ lệnh Java
#EXIT_CODE=$?
#cat output.txt
#cat error.txt >&2
#exit $EXIT_CODE