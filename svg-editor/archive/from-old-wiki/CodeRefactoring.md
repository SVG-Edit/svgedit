Introduction

SVG-edit started out as a much tinier project contained in just two JS files: svg-editor.js (essentially the editor UI) and svgcanvas.js (everything else). Over time, as SVG-edit has gained more and more features, these files naturally grew in size. And while extensions were introduced as one mechanism to separate features from the main code base, by Oct 2010, svgcanvas.js had reached 11,600 lines of JavaScript.

My main concern with this was that one giant JS file, no matter how well-commented and organized, cannot attract new developers. It's just too daunting to try and find out how the project works when it's one giant file. In a project that relies on casual contributors finding spare time, this is a huge problem. I experienced this first hand, since I had stopped heavily contributing to the project earlier in 2010 and then tried to come back near the end of 2010 and found myself lost.

The other problem is that the only realistic way of testing any new change was to invoke the editor and try out the feature. While this is a really good way to ensure your new feature works, it doesn't catch if you've broken other existing features. Over time, codebases that only rely on manual testing are bound to make less and less progress.
History

I'll note that a call to split out JS functionality into separate files was made by Narendra back in 2009 (when he had gone away from the project and tried to come back). He had even contributed new code in the form of a separate script to deal with localization, which was great. But at the time I didn't really know how I wanted to deal with modularization in a web app. I didn't want to be making separate GET requests for every script tag, and even his attempt with locale.js bothered me just a little. Plus, development was hot and heavy on new features ;)

But now that I was in Narendra's shoes and the amount of code had gone up by an order of magnitude, I realized how important it was. With this in mind, I set out to try and break apart the code a little bit. Starting with [r1817](https://code.google.com/p/svg-edit/source/detail?r=1817), I managed to split out some bits of code into a separate JS file. My goal in the refactoring was to make incremental changes that carefully started to split apart the code but didn't introduce any new bugs. I haven't been entirely successful in this, but there haven't been any major disasters, at least.

I eventually worked things out such that code that had been refactored lived somewhere under the 'svgedit' global namespace. The end goal is for everything to live under this namespace, but for now there are pieces that don't (svgEditor and svgCanvas).

For instance, browser.js introduces the following:

svgedit.browser.isOpera() svgedit.browser.isWebkit() svgedit.browser.isGecko() svgedit.browser.supportsSelectors() svgedit.browser.supportsPathReplaceItem() etc...

Here's a bullet-point summary of the state of affairs:

    Development versions of SVG-edit now have many <script> tags that load in all the JS modules.
    The dependencies between these files are currently maintained manually, the JS files must be loaded in the correct order
    Each new JS module has a corresponding test file under test/.
    The Makefile has been updated to compile all the JS modules using the Closure Compiler. This collapses all the JS into one compiled file and reduces the number of GET requests back to a sane level for a release version of SVG-edit.

NOTE: This is an ongoing effort. It's not done, and I don't know if it will ever be done. Currently svgcanvas.js is still around 8800 lines of code and occasionally growing. My silly benchmark for this effort is to have every file browsable online in Google Code :) Don't browse to svgcanvas.js in googlecode today. My browser grinds to a halt.
Unit Tests

As I refactor, I am taking the opportunity to add unit tests for each module/function/class refactored. As of Jan 2010, we are close to 500 unit tests. They are all ran at http://svg-edit.googlecode.com/svn/trunk/test/all_tests.html
Current Tasks

1) I introduced the concept of a Drawing earlier on that would encapsulate the state of a single open SVG document. The SVG editor has a handle to the current drawing and uses that instead of accessing svg DOM elements directly. Eventually all code that deals with layers, current editing context, document history and more will be moved into draw.js but for now, much of that code still lives in svgcanvas.js.

1) I'm in the process of migrating a large chunk of svgcanvas.js called "pathActions" into its own module (path.js). This piece of code did have a lot of dependencies so moving it piece-by-piece seemed like the right way to go. Currently it's about half-way migrated, with most of the 'public API' still living in svgcanvas.js.
TODOs

    Finish moving layers functionality into the Drawing class
    Move current_group and context functionality into Drawing
    Move setSvgString() and importSvgString() into a module
    Move pathActions into its own module
    Regenerate API documentation
    Determine how to convince the Closure Compiler to compile svgedit.browser.isOpera() into svgedit$browser$isOpera() so that it can also be optimized (reduces compiled file size and saves in run-time cost).
    ...

I have some other things I intend to investigate:

    Moving to something that uses jscode instead of our existing documentation style
    Moving to using a bit of Closure (for goog.require/provide). My concern with this is that there is significant overlap between Closure and jQuery and I'd want to make sure we are not pulling in code that we don't need.
