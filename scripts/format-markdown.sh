#!/bin/bash

SRCDIR="$(dirname "${BASH_SOURCE[0]}")" # check on Windows

for filename in $*; do
  # check if the $filename exists and if it's writeable
  if [ ! -w $filename ]; then
  echo "No matching file found: $filename"
  continue;
  fi
  # mostly to format code blocks with examples, unfortunately messes up bullet lists and tables
  npx prettier --write --single-quote $filename

  # repair the tables: remove superfluos spaces and dashes that make diffing revisions harder
  # and sed -i is not portable, so we need to use a temporary file
  sed -E -e "s/  +\|/ |/g" -e "s/\|  +/| /g" -e "s/-----+/----/g" $filename > $filename.tmp && mv $filename.tmp $filename

  # repair the bullet lists and various other markdown formatting issues
  npx --yes markdownlint-cli --fix --config $SRCDIR/../.markdownlint.yaml $filename
done
