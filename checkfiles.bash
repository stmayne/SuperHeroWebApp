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


commit_message=`git log -1 --pretty=%B`
commit_author=`git log -1 --pretty=%cn`
commit_email=`git log -1 --pretty=%ce`

git config --global user.name "$commit_author"
git config --global user.email "$commit_email"
git config --global push.default simple

git config credential.helper "store --file=.git/credentials"
echo "https://${GH_TOKEN}:@github.com" > .git/credentials


git branch travis-ci
git checkout travis-ci


git log > IDB.log
git add -A
git commit -m "Travis CI Commit"
git reset --soft HEAD~1
git commit -m "$commit_message"
git push -f "https://github.com/stmayne/cs373-idb.git" HEAD:travis-ci