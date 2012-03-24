#!/bin/sh
git checkout master
./build.sh
git checkout gh-pages
cp -r target/* .
git add .
git commit -m'Deploying pages'


