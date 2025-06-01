#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"/../docs || { echo "docs directory not found"; exit 1; }

added_files=$(git ls-files --others --exclude-standard | grep -E '.*\.md$')
modified_files=$(git ls-files -m | grep -E '.*\.md$')

if [ -z "$added_files" ]; then
    added=0
else
    added=$(echo "$added_files" | grep -c '^' 2>/dev/null || echo 0)
fi

if [ -z "$modified_files" ]; then
    modified=0
else
    modified=$(echo "$modified_files" | grep -c '^' 2>/dev/null || echo 0)
fi

msg=""
[ "$added" -gt 0 ] && msg="${added}개 문서 추가"
[ "$modified" -gt 0 ] && [ -n "$msg" ] && msg+=", "
[ "$modified" -gt 0 ] && msg+="${modified}개 문서 수정"

if [ -n "$msg" ]; then
    if [ "$added" -gt 0 ]; then
        echo "$added_files" | while read -r file; do
            if [ -n "$file" ]; then
                filename=$(basename "$file")
                "$SCRIPT_DIR"/metadata.ts create "$filename"
            fi
        done
    fi

    if [ "$modified" -gt 0 ]; then
        echo "$modified_files" | while read -r file; do
            if [ -n "$file" ]; then
                filename=$(basename "$file")
                "$SCRIPT_DIR"/metadata.ts update "$filename"
            fi
        done
    fi

    git add . ../.metadata.json
    git commit -m "$msg"
else
    echo "No changes to commit"
fi
