#!/bin/sh
git pull
sleep 1
git checkout master
sleep 1
./build.sh
sleep 1
git checkout gh-pages
sleep 1
cp -r -v target/* .
sleep 1
git add -A .
sleep 1
git commit -am 'Deploying pages'
sleep 1
git checkout master
sleep 1
