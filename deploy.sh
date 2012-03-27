#!/bin/sh
git pull
git checkout master
./build.sh
git checkout gh-pages
cp -r -v target/* .
git add -A .
git commit -am 'Deploying pages'
git checkout master

