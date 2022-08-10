# Projects used by SVG-edit

Like many open source projects, SVG-edit depends on other open source
projects. This page acknowledges these projects and the many software
developers across the globe without which our software would be sorely
lacking.

## jPicker

Christopher Tillman's awesome [jPicker](http://www.digitalmagicpro.com/jPicker/)
is used as our fill/stroke picker. The source code repository is now
hosted at GoogleCode.

Christopher was gracious enough to take suggestions from Pavol on how to
incorporate opacity and some callback functionality back upstream into
jPicker.

## jGraduate

Jeff Schiller created the excellent [jGraduate](https://code.google.com/p/jgraduate/)
plugin to select SVG gradients in SVG-edit.

## canvg

Gabe Lerner's excellent [canvg](https://github.com/gabelerner/canvg) library
has helped us bypass browsers' inability to save SVG files an PNGs, by
first rendering SVG images in an HTML5 Canvas element.

## jQuery UI

We use [jQuery-UI](https://jqueryui.com) for making the dialog boxes (color
picker, document properties) draggable, as well as for the opacity slider.

## js-hotkeys

[js-hotkeys](https://github.com/jeresig/jquery.hotkeys) is used to bind all
keyboard events in the editor.

## JQuery Web Spin-Button

George Adamson's [Web Spin-Button](http://www.softwareunity.com/jquery/JQuerySpinBtn)
provided a starting point to implementing a cross-browser spin control in
SVG-edit. A few bugs were fixed with compatibility and sent back to George
for hopeful inclusion in the next version of his jQuery plugin.

## SVG Icon Loader

Alexis Deveria's [svg-icon-loader](https://code.google.com/p/svg-icon-loader/)
is used to load in all the SVG icons for the SVG-edit user interface.

## Icons

Many of the icons used in SVG-edit come from the [Tango Desktop Project](http://tango.freedesktop.org/Tango_Desktop_Project)
which are released into the public domain. We also used a couple of icons
from the [Silk Icon Project](http://famfamfam.com/lab/icons/silk),
which is licensed under the Creative Commons Attribution 2.5 License.
Finally, some of the icons were hand-drawn (in SVG-edit itself).
