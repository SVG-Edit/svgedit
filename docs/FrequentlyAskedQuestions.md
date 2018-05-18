**NOTE: The following may contain outdated content.**

**Q: Why doesn't SVG-edit work in Internet Explorer 6-7-8?**

A: SVG-edit only works in IE6-7-8 if you have installed the Google Chrome Frame plugin. Internet Explorer 8 and under do not natively support Scalable Vector Graphics (SVG), however IE9+ does, and thus is supported starting in SVG-edit 2.6

In theory there are several other possibilities that could allow SVG-edit to work in IE: * someone gets it to work with the SVG Web shim * someone gets it to work with IE and the Adobe SVG Viewer * someone gets it to work with another SVG plugin

**Q: How can I make SVG-edit save files on my server?**

A: As of SVG-edit 2.5.1, an extension is available that overrides the default open/save behavior and instead uses PHP files to allow proper open/save dialog boxes. You can include the extension by adding `ext-server_opensave.js` to the `curConfig.extension` array in `svg-editor.js` or through other methods mentioned on our ConfigOptions page.

For other server-saving behavior you'll want to modify `ext-server_opensave.js` or the `filesave.php` file, both available under `editor/extensions/`.

**Q: How can I set the stroke to 'none'?**

A: Shift-clicking palette squares sets the Stroke paint value. Thus, you can shift-click on the None box (red x on white background) to clear the Stroke paint.

**Q: How can I help?**

A: See How to participate

**Q: How can I select an element when it's hidden or behind another one?**

A: Select an object. Shift+O will select the previous object Shift+P will select the next object. Using the wireframe mode may also help in seeing hidden objects.

**Q: How can I edit shapes that have been grouped?**

A: Double-click the group and you will shift the editing context to the group. The rest of the image will not be editable while you are in the group context. Once you are done editing inside the group, press Escape.

**Q: Can I trace over a raster (PNG, JPEG...) image?**

A: Yes, there are two methods you can use as of SVG-edit 2.4. 1. Go to the Document Properties, and enter the URL of the image under "Editor Background". This image will then fill the background without being saved as part of the image.

    Add a layer from the layer panel. Then draw a raster image (image icon) and enter your URL. Use the layer above this one to trace over the image without moving. Note that you can also hide/show layers to help your work.

**Q: How do I use the Wave Gadget?**

A: (Note that this information refers to the SVG-edit 2.3 Wave Gadget, the Wave Gadget has not been worked on for years though) Go to this wave wavesandbox.com!w+W7VzCLZk%A and there will be a button on the bottom that says "Install" and when you are editing things, you will see a SVG-edit icon in your toolbar that you can click to include the gadget into any blip.

**Q: How do I copy the style of an object to other(s)?**

A:

- Select the object you want to copy the style from. You'll see its Fill and Stroke style attributes displayed in the bottom toolbar.
- Holding Shift to keep the first object selected, select one or several other objects.
- Open the colorpicker by clicking on the color blocks in the bottom toolbar. If you want to copy the fill, select the Fill block. If you want to copy the stroke, select the Stroke block.
- Hit "Ok" in the colorpicker

The other objects will get the Fill or the Stroke of the first object.

**Q: How can I serve SVG graphic editor from my own server?**

A: You need to download the latest version to your server and unzip. The exact commands/instructions are here: <http://howik.com/Improve_your_user%27s_experience_by_adding_svg_graphic_editor_to_your_website_in_less_than_2_minutes>
