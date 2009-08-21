#!/bin/sh
DST="content/editor"
if [ -e "${DST}" ]; then
    rm -rf "${DST}"
fi
cp -R ../editor content/
SVNS=`find content/editor -name '.svn'`
rm -rf ${SVNS}
