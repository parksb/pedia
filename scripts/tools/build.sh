#!/bin/sh

mkdir -p ../build.tmp
mkdir -p ../build.tmp/images
cp -r ../docs/images ../build.tmp
cp -r assets ../build.tmp
cp -r public/. ../build.tmp

if [ -d "../docs/private" ]; then
  mkdir -p ../build.tmp/private
  mkdir -p ../build.tmp/private/images
  cp -r ../docs/private/images ../build.tmp/private
fi

tsx src/main.ts

if [ -d "../build" ]; then
  rm -rf ../build
fi
mv ../build.tmp ../build
