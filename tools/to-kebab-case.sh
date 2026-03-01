#!/bin/bash

echo "$1" | tr '[:upper:]' '[:lower:]' | tr -d "'" | sed 's/[^a-z0-9 ]//g' | tr -s ' ' '-'
