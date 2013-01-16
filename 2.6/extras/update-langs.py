#!/usr/bin/env python
# -*- coding: iso-8859-15 -*-
"""
This is a helper script for the svg-edit project, useful for managing
all the language files

Licensed under the MIT License as is the rest of the project
Requires Python 2.6

Copyright (c) 2010 Jeff Schiller
"""
import os
import json
from types import DictType

def changeTooltipTarget(j):
	"""
	Moves the tooltip target for some tools
	"""
	tools = ['rect_width', 'rect_height']
	for row in j:
		try:
			id = row['id']
			if id in tools:
				row['id'] = row['id'] + '_tool'
		except KeyError:
			pass
	
def updateMainMenu(j):
    """
    Converts title into textContent for items in the main menu
    """
    tools = ['tool_clear', 'tool_open', 'tool_save', 'tool_docprops']
    for row in j:
        try:
            ids = row['id']
            if ids in tools:
                row[u'textContent'] = row.pop('title')
        except KeyError:
            pass

def ourPrettyPrint(j):
    """
    Outputs a string representation of the JSON object passed in
    formatted properly for our lang.XX.js files.
    """
    s = '[' + os.linesep
    js_strings = None
    j.sort()
    for row in j:
        try:
            ids = row['id']
            row_string = json.dumps(row, sort_keys=True, ensure_ascii=False)
            s += row_string + ',' + os.linesep
        except KeyError:
            if type(row) is DictType:
                js_strings = row

    s += json.dumps(js_strings, sort_keys=True, ensure_ascii=False, indent=1) + os.linesep
    s += ']'
    return s

def processFile(filename):
    """
    Loads the given lang.XX.js file, processes it and saves it
    back to the file system
    """
    in_string = open('../editor/locale/' + filename, 'r').read()

    try:
        j = json.loads(in_string)

        # process the JSON object here
        changeTooltipTarget(j)

        # now write it out back to the file
        s = ourPrettyPrint(j).encode("UTF-8")
        open('../editor/locale/' + filename, 'w').write(s)

        print "Updated " + filename
    except ValueError:
        print "ERROR!  " + filename + " was not valid JSON, please fix it!"

if __name__ == '__main__':
    # get list of all lang files and process them
    for file_name in os.listdir('../editor/locale/'):
        if file_name[:4] == "lang":
            processFile(file_name)
