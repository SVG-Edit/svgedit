Info

8th International Conference on Scalable Vector Graphics August 30 to September 1, 2010 Paris, France
Abstract

Paper title: SVG-edit

Paper subtitle: A complete vector graphics editor in the browser

Authors: Rusnak, Pavol

Paper topic: SVG Authoring Tools and Techniques

Abstract:

SVG-edit is a fast, web-based, Javascript-driven SVG editor that works in any modern browser. It is inspired by Inkscape and despite its youth (slightly more than a year of development) already provides a good set of features to create advanced vector drawings. Open-source components like jQuery are used and SVG-edit itself is also licensed under a liberal Apache License 2.0, which makes it very easy to embed the editor in both commercial and non-commercial projects. The talk will focus on a short history plus overview of the project and the new features implemented in the last SVG-edit releases. We will mention various challenges we faced during the development and also describe the browser missing features which would make life a lot easier. We'll conclude the talk with a live demonstration of the editor and other projects that already use embedded SVG-edit.

Remarks:
codedread's comments

Pavol, I would recommend talking about the new features in 2.4, 2.5 (and if it is released prior to the conference, 2.6). Also, I would recommend discussing some of the challenges so that browsers are more aware of them. Please feel free to take comments from this list of challenges to weave them into your talk:

    browser support of content-editable in HTML does not extend to HTML-inside-SVG (using foreignObject) in an interoperable way. This prevents rich text in SVG-edit. Try the T+ button on this experimental branch: http://svg-edit.googlecode.com/svn/branches/enhtext/editor/svg-editor.html
    need all browsers to support the [W3C File API](http://www.w3.org/TR/FileAPI/) (to allow local files to be loaded into SVG-edit). Specifically Safari, Opera, IE9 and Chrome (Google has plans to support this in Chrome 5).
    want browsers to start implementing the [W3C FileWriter](http://dev.w3.org/2009/dap/file-system/file-writer.html) interface (I think Chrome has plans for Version 5)
    want browsers to allow better Canvas-SVG integration (i.e. export Canvas to SVG, [export SVG to PNG](http://dev.w3.org/html5/canvas-api/canvas-2d-api.html#todataurl-method), embed canvas directly in SVG for raster effects)
    consistent support of SVG DOM interfaces, specifically things like SVGPathSegList (adeveria has more details, I'm sure), more details on the BrowserBugs page
