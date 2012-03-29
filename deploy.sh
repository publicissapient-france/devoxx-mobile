#!/bin/sh
rm -rf target
mkdir target
mkdir target/website
./build.sh
mkdir target/repo-clone
git clone git@github.com:xebia-france/devoxx-mobile.git target/repo-clone
cd target/repo-clone
git checkout gh-pages
git reset --hard
cp -r -v ../website/* .
git add -A .
git commit -am 'Deploying pages'
git push origin gh-pages
echo "Web site update done"
