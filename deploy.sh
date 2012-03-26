#!/bin/sh
git checkout master
./build.sh
git checkout gh-pages
cp -r -v target/* .
git add .
git commit -m'Deploying pages'
#git push origin gh-pages


