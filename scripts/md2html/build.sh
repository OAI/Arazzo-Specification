#!/bin/bash

# Author: @frankkilcommins (inspired by the work of @MikeRalphson)
# Author: @MikeRalphson

# run this script from the root of the repo. It is designed to be run by a GitHub workflow.
# It contains bashisms

mkdir -p deploy/arazzo
mkdir -p deploy/js

cd scripts/md2html

# temporarily copy installed version of respec into build directory
cp -p ../../node_modules/respec/builds/respec-w3c.* ../../deploy/js/

latest=`git describe --abbrev=0 --tags`
latestCopied=none
lastMinor="-"
for filename in $(ls -1 ../../versions/[123456789].*.md | sort -r) ; do
  version=$(basename "$filename" .md)
  minorVersion=${version:0:3}
  tempfile=../../deploy/arazzo/v$version-tmp.html
  echo -e "\n=== v$version ==="

  node md2html.js --respec --maintainers ../../MAINTAINERS.md ${filename} > $tempfile
  npx respec --use-local --src $tempfile --out ../../deploy/arazzo/v$version.html
  rm $tempfile

  if [ $version = $latest ]; then
    if [[ ${version} != *"rc"* ]];then
      # version is not a Release Candidate
      ( cd ../../deploy/arazzo && ln -sf v$version.html latest.html )
      latestCopied=v$version
    fi
  fi

  if [ ${minorVersion} != ${lastMinor} ]; then
    ( cd ../../deploy/arazzo && ln -sf v$version.html v$minorVersion.html )
    lastMinor=$minorVersion
  fi
done
echo Latest tag is $latest, copied $latestCopied to latest.html

# clean up build directory
rm ../../deploy/js/respec-w3c.*
