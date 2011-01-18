#!/usr/bin/env python
# -*- coding: utf-8 -*-

# ship.py
#
# Licensed under the Apache 2 License as is the rest of the project
# Copyright (c) 2011 Jeff Schiller
#
# This script has very little real-world application.  It is only used in our pure-client web app
# served on GoogleCode so we can have one HTML file, run a build script and generate a 'release'
# version without having to maintain two separate HTML files.  It does this by evaluating
# 'processing comments' that are suspicously similar to IE conditional comments and then outputting
# a new HTML file after evaluating particular variables.
#
# This script takes the following inputs:
#
# * a HTML file (--i=in.html)
# * a series of flag names (--on=Foo --on=Bar)
#
# Example:
#
# in.html:
#   <!--{if foo}>
#     FOO!
#   <!{else}-->
#     BAR!
#   <!--{endif}-->
#
# $ ship.py --i in.html --on foo
#
# out.html:
#   <!--{if foo}-->
#     FOO!
#   <!--{else}>
#     BAR!
#   <!{endif}-->
#
# It has the following limitations:
#
# 1) Only if-else-endif are currently supported.
# 2) All processing comments must be on one line with no other non-whitespace characters.
# 3) Comments cannot be nested.

import optparse
import os

inside_if = False
last_if_true = False

_options_parser = optparse.OptionParser(
	usage='%prog --i input.html [--on flag1]',
	description=('Rewrites an HTML file based on conditional comments and flags'))
_options_parser.add_option('--i',
	action='store', dest='input_html_file', help='Input HTML filename')
_options_parser.add_option('--on',
	action='append', type='string', dest='enabled_flags',
	help='name of flag to enable')

def parse_args(args=None):
  options, rargs = _options_parser.parse_args(args)
  return options, (None, None)

def parseComment(line, line_num, enabled_flags):
  global inside_if
  global last_if_true

  start = line.find('{')
  end = line.find('}')
  statement = line[start+1:end].strip()
  if statement.startswith('if '):
    if inside_if == True:
      print 'Fatal Error: Nested {if} found on line ' + str(line_num)
      print line
      quit()

    # Evaluate whether the expression is true/false.
    # only one variable name allowed for now
    variable_name = statement[3:].strip()
    if variable_name in enabled_flags:
      last_if_true = True
      line = '<!--{if ' + variable_name + '}-->'
    else:
      last_if_true = False
      line = '<!--{if ' + variable_name + '}>'

    inside_if = True

  elif statement == 'else':
    if inside_if == False:
      print 'Fatal Error: {else} found without {if} on line ' + str(line_num)
      print line
      quit()
    if inside_if == 'else':
      print 'Fatal Error: Multiple {else} clauses found in the same if on line ' + str(line_num)
      print line
      quit()

    if last_if_true:
      line = '<!--{else}>'
    else:
      line = '<!{else}-->'

    # invert the logic so the endif clause is closed properly
    last_if_true = not last_if_true

    # ensure we don't have two else statements in the same if
    inside_if = 'else'

  elif statement == 'endif':
    if inside_if == False:
      print 'Fatal Error: {endif} found without {if} on line ' + str(line_num)
      print line
      quit()

    if last_if_true:
      line = '<!--{endif}-->'
    else:
      line = '<!{endif}-->'

    inside_if = False

  return line


def ship(inFileName, enabled_flags):
  # read in HTML file
  lines = file(inFileName, 'r').readlines()
  out_lines = []
  i = 0

  # loop for each line of markup
  for line in lines:
    strline = line.strip()
    # if we find a comment, process it and print out
    if strline.startswith('<!--{') or strline.startswith('<!{'):
      # using the same indentation as the previous line
      start = line.find('<')
      out_lines.append(line[:start] \
        + parseComment(strline, i, enabled_flags) \
        + os.linesep)
    else: # else append line to the output list
      out_lines.append(line)
    i += 1
  
  return ''.join(out_lines)

if __name__ == '__main__':
  options, (input, output) = parse_args()

  if options.input_html_file != None:
    enabled_flags = []
    if options.enabled_flags != None:
      enabled_flags.extend(options.enabled_flags)
    out_file = ship(options.input_html_file, enabled_flags)
    print out_file
