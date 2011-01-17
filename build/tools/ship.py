#!/usr/bin/env python
# -*- coding: utf-8 -*-

# ship.py
#
# Licensed under the Apache 2 License as is the rest of the project
#
# Copyright (c) 2011 Jeff Schiller
#
# This script takes the following inputs:
#
# * a HTML file
# * a series of flag names
#
# It parses, the HTML file, enables/disables sections of the makrup based
# on conditional comments and flag values, then outputs a new HTML file.
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
# $ ship.py --i in.html --o test-out.html --enable foo
#
# out.html:
#   <!--{if foo}-->
#     FOO!
#   <!--{else}>
#     BAR!
#   <!{endif}-->
#
# Only if-else-endif are currently supported.  All conditional comment expressions must
# be on one line with no other non-whitespace characters.

import optparse

_options_parser = optparse.OptionParser(
	usage="%prog --i input.svg --o output.svg [--enable flag1]",
	description=("Hello world!"))
_options_parser.add_option("--i",
	action="store", dest="input_html_file", help="Input HTML filename")
_options_parser.add_option("--o",
	action="store", dest="output_html_file", help="Output HTML filename")
_options_parser.add_option("--on",
	action="append", type="string", dest="enabled_flags",
	help="name of flag to enable")

def parse_args(args=None):
	options, rargs = _options_parser.parse_args(args)
	print options

	if rargs:
		_options_parser.error("Additional arguments not handled: %r, see --help" % rargs)

	return options, (None, None)

if __name__ == '__main__':
  options, (input, output) = parse_args()
