#!/bin/bash

# Author: @frankkilcommins (inspired by the work of @MikeRalphson)
# Author: @MikeRalphson

# run this script from the root of the repo. It is designed to be run by a GitHub workflow.
# It contains bashisms

mkdir -p deploy/arazzo
mkdir -p deploy/js

cd scripts/md2html

cp -p js/* ../../deploy/js 2> /dev/null
cp -p markdown/* ../../deploy/ 2> /dev/null


# latest=`git describe --abbrev=0 --tags` -- introduce after release tags created
latest=1.0.0
latestCopied=none
for filename in ../../versions/[123456789].*.md ; do
  version=$(basename "$filename" .md)
  node md2html.js --respec --maintainers ../../MAINTAINERS.md ${filename} > ../../deploy/arazzo/v$version.html
  if [ $version = $latest ]; then
    if [[ ${version} != *"rc"* ]];then
      # version is not a Release Candidate
      cp -p ../../deploy/arazzo/v$version.html ../../deploy/arazzo/latest.html
      latestCopied=v$version
    fi
  fi
done
echo Latest tag is $latest, copied $latestCopied to latest.html

