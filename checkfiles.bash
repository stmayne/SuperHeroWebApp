#!/bin/bash

check_file () {
    if [ -f "$1" ]
    then
        echo "$1 found"
    else
        echo "$1 not found"
        exit -1
    fi
}

echo "Checking for files"

check_file "UML.pdf"
check_file "apiary.apib"
check_file "models.py"
check_file "models.html"
check_file "report.pdf"
check_file "config.py"
check_file "IDB.log"
check_file "tests.py"
check_file "tests.out"
check_file "create_models.py"

