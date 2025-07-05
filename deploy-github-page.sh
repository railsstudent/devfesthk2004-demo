#!/bin/sh

if [ $# -lt 1 ]; then
    echo "Usage: $0 <app folder name>"
    exit 1
fi

echo "delete dist/$1"
rm -rf dist/$1
echo "build project $1 starts"
ng build --project=$1
cp ./dist/$1/index.html  ./dist/$1/404.html
touch "./dist/$1/.nojekyll"
echo 'build project finishes'
