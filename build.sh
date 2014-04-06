#!/bin/sh
node r.js -o app.build.js
echo "Uglifying file: javascript/app.js"
uglifyjs -o target/website/javascript/app.js javascript/app.js

