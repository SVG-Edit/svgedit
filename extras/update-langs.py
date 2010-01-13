#!/usr/bin/env python
# -*- coding: utf-8 -*-

# This is a helper script for the svg-edit project, useful for updating language files
# Licensed under the Apache 2 License as is the rest of the project
# Requires Python 2.6
#
# Copyright (c) 2010 Jeff Schiller

# TODO: Fix lang.es.js which apparently is not proper JSON (encoding issues?)

import os
import sys
import re
import json

def processFile(filename):
	in_string = open('./editor/locale/'+filename).read()
	try:
		j = json.loads(in_string)
		pass
	except ValueError:
		print "ERROR!  " + filename + " was not valid JSON, please fix it!"

if __name__ == '__main__':
	# get list of all lang files
	for file in os.listdir('./editor/locale/'):
		if file[:4] == "lang":
			processFile(file)