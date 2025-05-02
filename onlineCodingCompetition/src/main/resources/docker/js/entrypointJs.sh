#!/bin/bash
set -e

# Lấy tên file từ tham số dòng lệnh
CODE_FILE=$1

cd /app/code

# Chạy mã nguồn JavaScript với Node.js
#echo "Running JavaScript code..."
node $CODE_FILE > output.txt 2> error.txt

# Trả về exit code từ lệnh Node.js
EXIT_CODE=$?
cat output.txt
cat error.txt >&2
exit $EXIT_CODE



##!/bin/bash
#set -e
#
## Lấy tên file và file test cases từ tham số dòng lệnh
#CODE_FILE=$1
#TEST_CASES_FILE=$2
#
#cd /app/code
#
## Chạy mã nguồn JavaScript với Node.js
#echo "Running JavaScript code..."
#node $CODE_FILE < $TEST_CASES_FILE > output.txt 2> error.txt
#
## Trả về exit code từ lệnh Node.js
#EXIT_CODE=$?
#cat output.txt
#cat error.txt >&2
#exit $EXIT_CODE