#!/bin/sh

mkdir -p ../build
mkdir -p ../build/images
cp -r ../docs/images ../build
cp -r assets ../build
cp -r public/. ../build

if [ -d "../docs/private" ]; then
  mkdir -p ../build/private
  mkdir -p ../build/private/images
  cp -r ../docs/private/images ../build/private
fi

ts-node index.ts
