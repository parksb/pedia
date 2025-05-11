#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"/../docs || { echo "docs directory not found"; exit 1; }

added=$(git ls-files --others --exclude-standard | grep -E -c '.*\.md$')
modified=$(git ls-files -m | grep -E -c '.*\.md$')

msg=""
[ "$added" -gt 0 ] && msg="${added}개 문서 추가"
[ "$modified" -gt 0 ] && [ -n "$msg" ] && msg+=", "
[ "$modified" -gt 0 ] && msg+="${modified}개 문서 수정"

if [ -n "$msg" ]; then
    git add .
    git commit -m "$msg"
else
    echo "No changes to commit"
fi
