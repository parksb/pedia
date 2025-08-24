#!/bin/bash

INPUT=$1
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT="$SCRIPT_DIR"/../docs/images/$(uuidgen | tr "[:upper:]" "[:lower:]")
WIDTH=900

if [[ "$INPUT" == *.svg ]]; then
    OUTPUT="$OUTPUT.svg"
    cp "$INPUT" "$OUTPUT"
else
    OUTPUT="$OUTPUT.webp"
    if (( "$(identify -format "%w" "$INPUT")" > "$WIDTH" )); then
        magick "$INPUT" -resize "$WIDTH"x "$OUTPUT"
    else
        magick "$INPUT" "$OUTPUT.webp"
    fi
fi

if command -v trash &> /dev/null; then
    trash "$INPUT"
else
    read -pr "Are you sure you want to delete $INPUT? (y/N): " confirm
    if [[ "$confirm" == "y" ]]; then
        rm "$INPUT"
    fi
fi

echo "$OUTPUT"
