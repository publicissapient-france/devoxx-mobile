#!/bin/sh
mkdir target/
mkdir target/webstore
# cp -r webstore target/webstore
cp webstore/icon-webstore-128.png target/webstore
cp manifest.json target/webstore
zip -r target/devoxx-france-2012-webstore.zip target/webstore
