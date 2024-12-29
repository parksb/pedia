#!/bin/bash

INPUT=$1
OUTPUT=$(uuidgen | tr "[:upper:]" "[:lower:]").webp
WIDTH=900

if (( "$(identify -format "%w" "$INPUT")" > "$WIDTH" )); then
  magick -resize "$WIDTH"x "$INPUT" "$OUTPUT"
else
  magick "$INPUT" "$OUTPUT"
fi

rm "$INPUT"
echo "$OUTPUT"
