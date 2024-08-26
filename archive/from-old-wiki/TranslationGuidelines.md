To commit translations to the main code base, please see: CommitPolicy

Under construction

http://imgh.us/SVG-edit_Languages.svg http://imgh.us/SVG-edit_Languages.jpg]

shows the status of translations for each SVG-edit language file.
'>

Introduction Explanation of this document.
IDs Details Describes the IDs.
js_strings Describes the JavaScript strings.
Introduction

This page lists the existing IDs in the language files, and explains what they "technically" represent, for a meaningful - yet simple - translation of the SVG-edit interface.

New ID since the last version
Active ID
ID made obsolete last version
Obsolete ID

There is also a block of JavaScript strings, at the end of each language file. Their second part needs to be translated.

The current available languages files can be found here. Click on the language file you want, then select "View Raw file" to display the file and save it as a .js file that you can edit.

This page is sorted in the same order as the language files themselves.

Notes: * a '%string' is a value and must not be translated. Ex: '%s'. * \n inside a long line:

    Long lines are sometimes split with a
    \nwhich must not be translated. It may be moved
    \ninto the sentences
    \nfor verbose languages.

    References to shortcuts (numbers or words inside a pair of "[ ]" brackets still appearing in a language file must be deleted from the line.

IDs Details

align_relative_to

DescriptionVerb. To align objects relatively to either objects or the page. Default languageAlign relative to ... In use since2.4 Obsolete since-

angleLabel

DescriptionNoun. The angle of rotation applied to an object. Default languageangle: In use since2.4 Obsolete since2.5

bkgnd_color

DescriptionVerb. To change the background color / the opacity. Default languageChange background color/opacity In use since2.4 Obsolete since-

circle_cx

DescriptionVerb. To change the horizontal coordinate cx of a circle. Default languageChange circle's cx coordinate In use since2.4 Obsolete since-

circle_cy

DescriptionVerb. To change the vertical coordinate cy of a circle. Default languageChange circle's cy coordinate In use since2.4 Obsolete since-

circle_r

DescriptionVerb. To change the radius of a circle. Default languageChange circle's radius In use since2.4 Obsolete since-

connector_no_arrow

DescriptionNoun. Option indicating that the line should not have arrows. Default languageNo arrow In use since2.5 Obsolete since-

copyrightLabel

DescriptionSentence start. Prefix to "SVG-edit" credit in bottom-right corner. Default languagePowered by In use since2.5 Obsolete since-

cornerRadiusLabel

DescriptionVerb. Value of the radius of the corners, for a rectangle with rounded corners. Note: This text used to be "Corner Radius:" and was a label. As of 2.5 it refers to the tooltip text Default languageChange Rectangle Corner Radius In use since2.4 Obsolete since

curve_segments

DescriptionNoun. Type of segment: curved segment, as opposed to straight line. Default languageCurve In use since2.4 Obsolete since-

ellipse_cx

DescriptionVerb. To change the horizontal coordinate cx of an ellipse. Default languageChange ellipse's cx coordinate In use since2.4 Obsolete since-

ellipse_cy

DescriptionVerb. To change the vertical coordinate cy of an ellipse. Default languageChange ellipse's cy coordinate In use since2.4 Obsolete since-

ellipse_rx

DescriptionVerb. To change the horizontal radius x of an ellipse. Default languageChange ellipse's x radius In use since2.4 Obsolete since-

ellipse_ry

DescriptionVerb. To change the vertical radius y of an ellipse. Default languageChange ellipse's y radius In use since2.4 Obsolete since-

fill_color

DescriptionVerb. To change the fill color of an object. Default languageChange fill color In use since2.4 Obsolete since-

fill_tool_bottom

DescriptionNoun. The inner painting of an object. Default languagefill: In use since2.4 Obsolete since2.5

fitToContent

DescriptionAdjective or past participle. Adjusted to the content of the drawing, cropped. Default languageFit to Content In use since2.4 Obsolete since-

fit_to_all

DescriptionVerb. To adjust the zoom level to include everything drawn in all layers. Default languageFit to all content In use since2.4 Obsolete since-

fit_to_canvas

DescriptionVerb. To adjust the zoom level to the canvas dimensions. Default languageFit to canvas In use since2.4 Obsolete since-

fit_to_layer_content

DescriptionVerb. To adjust the zoom level to include everything in the current layer. Default languageFit to layer content In use since2.4 Obsolete since-

fit_to_sel

DescriptionVerb. To adjust the zoom level to include all the selected objects. Default languageFit to selection In use since2.4 Obsolete since-

font_family

DescriptionVerb. To change the font-family of a text element. Default languageChange Font Family In use since2.4 Obsolete since-

idLabel

DescriptionVerb. To change the ID of an element. Default languageIdentify the element In use since2.5 Obsolete since-

icon_large

DescriptionAdjective. Large, for the size of the icons. Default languageLarge In use since2.4 Obsolete since-

icon_medium

DescriptionAdjective. Average, for the size of the icons. Default languageMedium In use since2.4 Obsolete since-

icon_small

DescriptionAdjective. Small, for the size of the icons. Default languageSmall In use since2.4 Obsolete since-

icon_xlarge

DescriptionAdjective. Extra large, for the size of the icons. Default languageExtra Large In use since2.4 Obsolete since-

iheightLabel

DescriptionNoun. Height. Default languageheight: In use since2.4 Obsolete since2.5

image_height

DescriptionVerb. To change the height of an image. Default languageChange image height In use since2.4 Obsolete since-

image_opt_embed

DescriptionVerb. To embed (include, integrate) the images as data (for local files) Default languageEmbed data (local files) In use since2.4 Obsolete since-

image_opt_ref

DescriptionVerb. To use the reference of the images (URLs of the images, instead of embedding them Default languageUse file reference In use since2.4 Obsolete since-

image_url

DescriptionVerb. To change the URL of an image. Default languageChange URL In use since2.4 Obsolete since-

image_width

DescriptionVerb. To change the width of an image. Default languageChange image width In use since2.4 Obsolete since-

includedImages

DescriptionAdjective or past participle. Included, integrated, embedded images. Default languageIncluded Images In use since2.4 Obsolete since-

iwidthLabel

DescriptionNoun. Width. Default languagewidth: In use since2.4 Obsolete since2.5

largest_object

DescriptionSuperlative adjective. The largest object. Default languagelargest object In use since2.4 Obsolete since-

layer_delete

DescriptionVerb. To delete the current layer. Default languageDelete Layer In use since2.4 Obsolete since-

layer_down

DescriptionVerb. To move the current layer down in the layer table. Default languageMove Layer Down In use since2.4 Obsolete since-

layer_new

DescriptionNoun. A new layer. Default languageNew Layer In use since2.4 Obsolete since-

layer_rename

DescriptionVerb. To give a new name to the current layer. Default languageRename Layer In use since2.4 Obsolete since-

layer_up

DescriptionVerb. To move the current layer up in the layer table. Default languageMove Layer Up In use since2.4 Obsolete since-

layersLabel

DescriptionNoun. The layers. Default languageLayers: In use since2.4 Obsolete since-

line_x1

DescriptionVerb. To change the horizontal coordinate x of the starting point, for a line. Default languageChange line's starting x coordinate In use since2.4 Obsolete since-

line_x2

DescriptionVerb. To change the horizontal coordinate x of the ending point, for a line. Default languageChange line's ending x coordinate In use since2.4 Obsolete since-

line_y1

DescriptionVerb. To change the vertical coordinate y of the starting point, for a line. Default languageChange line's starting y coordinate In use since2.4 Obsolete since-

line_y2

DescriptionVerb. To change the vertical coordinate y of the ending point, for a line. Default languageChange line's ending y coordinate In use since2.4 Obsolete since-

linecap_butt

DescriptionNoun. To made the end of a line stop exactly at its end coordinate. Default languageLinecap: Butt In use since2.5 Obsolete since-

linecap_round

DescriptionNoun. To made the end of a line end rounded. Default languageLinecap: Round In use since2.5 Obsolete since-

linecap_round

DescriptionNoun. To made the end of a line end square. Default languageLinecap: Square In use since2.5 Obsolete since-

linejoin_bevel

DescriptionNoun. To make line joints use straight, cut off edges. Default languageLinejoin: Bevel In use since2.5 Obsolete since-

linejoin_miter

DescriptionNoun. To make line joints use regular, usually pointy edges. Default languageLinejoin: Miter In use since2.5 Obsolete since-

linejoin_round

DescriptionNoun. To make line joints use round edges. Default languageLinejoin: Round In use since2.5 Obsolete since-

main_icon

DescriptionNoun. The main (application) menu. Default languageMain Menu In use since2.5 Obsolete since-

mode_connect

DescriptionVerb. Option to connect two objects with a line. Default languageConnect two objects In use since2.5 Obsolete since-

page

DescriptionNoun. The page. Default languagepage In use since2.4 Obsolete since-

palette

DescriptionNoun. The palette, the painter's tool which holds all the available colors. Default languageClick to change fill color, shift-click to change stroke color In use since2.4 Obsolete since-

path_node_x

DescriptionVerb. To change the horizontal coordinate x, for a node (point). Default languageChange node's x coordinate In use since2.4 Obsolete since-

path_node_y

DescriptionVerb. To change the vertical coordinate y, for a node (point). Default languageChange node's y coordinate In use since2.4 Obsolete since-

rect_height

DescriptionVerb. To change the height of a rectangle. Default languageChange rectangle height In use since2.4 Obsolete since-

rect_rx

DescriptionVerb. To change the value of the radius of the corners, for a rectangle with rounded corners. Default languageChange Rectangle Corner Radius In use since2.4 Obsolete since-

rect_width

DescriptionVerb. To change the width of a rectangle. Default languageChange rectangle width In use since2.4 Obsolete since-

relativeToLabel

DescriptionAdverb. (Objects aligned) relatively to either objects, or the page. Default languagerelative to: In use since2.4 Obsolete since-

rheightLabel

DescriptionNoun. Height. Default languageheight: In use since2.4 Obsolete since2.5

rwidthLabel

DescriptionNoun. Width. Default languagewidth: In use since2.4 Obsolete since2.5

seg_type

DescriptionVerb. To change the type of a segment. Default languageChange Segment type In use since2.4 Obsolete since-

selLayerLabel

DescriptionVerb. To move elements to (another layer): Default languageMove elements to: In use since2.4 Obsolete since-

selLayerNames

DescriptionVerb. To move selected elements to a different layer. Default languageMove selected elements to a different layer In use since2.4 Obsolete since-

selectedPredefined

DescriptionVerb. To select predifined values, for the canvas dimensions. Default languageSelect predefined: In use since2.4 Obsolete since-

selected_objects

DescriptionPast participle. Objects which are selected. Default languageselected objects In use since2.4 Obsolete since-

selected_x

DescriptionVerb. To change the horizontal coordinate X. Default languageChange X coordinate In use since2.4 Obsolete since-

selected_y

DescriptionVerb. To change the vertical coordinate Y. Default languageChange Y coordinate In use since2.4 Obsolete since-

smallest_object

DescriptionSuperlative adjective. The smallest object. Default languagesmallest object In use since2.4 Obsolete since-

straight_segments

DescriptionNoun. Type of segment: straight line, as opposed to curve. Default languageStraight In use since2.4 Obsolete since-

stroke_color

DescriptionVerb. To change the color of the outline (exterior) of an element. Default languageChange stroke color In use since2.4 Obsolete since-

stroke_style

DescriptionVerb. To change the style of dashes, for the outline (exterior) of an element. Default languageChange stroke dash style In use since2.4 Obsolete since-

stroke_tool_bottom

DescriptionNoun. The outline (exterior) of an element. This includes the color/opacity, the line thicknes and the line style (dashes and/or dots). Default languagestroke: In use since2.4 Obsolete since2.5

stroke_width

DescriptionVerb. To change the width of the outline (exterior) of an element. Default languageChange stroke width by 1, shift-click to change by 0.1 In use since2.4 Obsolete since-

svginfo_bg_note

DescriptionNote : Background will not be saved with the image. Default languageNote: Background will not be saved with image. In use since2.4 Obsolete since-

svginfo_change_background

DescriptionNoun. The background color or image of the editor. Default languageEditor Background In use since2.4 Obsolete since-

svginfo_dim

DescriptionNoun. The dimensions of the canvas. Default languageCanvas Dimensions In use since2.4 Obsolete since-

svginfo_editor_prefs

DescriptionNoun. The preferences of the editor. Default languageEditor Preferences In use since2.4 Obsolete since-

svginfo_height

DescriptionNoun. Height. Default languageHeight: In use since2.4 Obsolete since-

svginfo_icons

DescriptionNoun. Size of the icons. Default languageIcon size In use since2.4 Obsolete since-

svginfo_image_props

DescriptionNoun. The properties of the image. Default languageImage Properties In use since2.4 Obsolete since-

svginfo_lang

DescriptionNoun. Language (of the editor). Default languageLanguage In use since2.4 Obsolete since-

svginfo_title

DescriptionNoun. Title (of the image). Default languageTitle In use since2.4 Obsolete since-

svginfo_width

DescriptionNoun. Width (of the image). Default languageWidth: In use since2.4 Obsolete since-

text

DescriptionNoun. Text, content of a text element. Default languageChange text contents In use since2.4 Obsolete since-

toggle_stroke_tools

DescriptionVerb. To show/hide the additional stroke tools Default languageShow/hide more stroke tools In use since2.5 Obsolete since-

tool_alignbottom

DescriptionVerb. To align the bottom of selected elements. Default languageAlign Bottom In use since2.4 Obsolete since-

tool_aligncenter

DescriptionVerb. To center vertically, relatively to the vertical axis Default languageAlign Center In use since2.4 Obsolete since-

tool_alignleft

DescriptionVerb. To align the left sides of selected elements. Default languageAlign Left In use since2.4 Obsolete since-

tool_alignmiddle

DescriptionVerb. To center horizontally, relatively to the horizontal axis Default languageAlign Middle In use since2.4 Obsolete since-

tool_alignright

DescriptionVerb. To align the right sides of selected elements. Default languageAlign Right In use since2.4 Obsolete since-

tool_aligntop

DescriptionVerb. To align the top sides of selected elements. Default languageAlign Top In use since2.4 Obsolete since-

tool_angle (was: angle)

DescriptionVerb. To change the angle of rotation applied to an object. Default languageChange rotation angle In use since2.4 Obsolete since-

tool_blur

DescriptionVerb. To change the gaussian blur value of an object. Default languageChange gaussian blur value In use since2.5 Obsolete since-

tool_bold

DescriptionAdjective. Bold text Default languageBold Text In use since2.4 Obsolete since-

tool_circle

DescriptionNoun. Circle. Default languageCircle In use since2.4 Obsolete since-

tool_clear

DescriptionAdjective. New Image Default languageNew Image In use since2.4 Obsolete since-

tool_clone

DescriptionVerb. To clone an element Default languageClone Element In use since2.4 Obsolete since-

tool_clone_multi

DescriptionVerb. To clone elements Default languageClone Elements In use since2.4 Obsolete since-

tool_delete

DescriptionVerb. To delete an element Default languageDelete Element In use since2.4 Obsolete since-

tool_delete_multi

DescriptionVerb. To delete selected elements Default languageDelete Selected Elements In use since2.4 Obsolete since-

tool_docprops

DescriptionNoun. The document properties Default languageDocument Properties In use since2.4 Obsolete since-

tool_docprops_cancel

DescriptionVerb. To cancel Default languageCancel In use since2.4 Obsolete since-

tool_docprops_save

DescriptionNoun. OK (does not mean "Save") Default languageOK In use since2.4 Obsolete since-

tool_ellipse

DescriptionNoun. Ellipse Default languageEllipse In use since2.4 Obsolete since-

tool_export

DescriptionVerb. To save the image as a PNG, JPEG, BMP, or WEBP file Default languageExport In use since2.5 Obsolete since-

tool_eyedropper

DescriptionVerb. Tool for copying the style from one element to another Default languageEye Dropper Tool In use since2.5 Obsolete since-

tool_fhellipse

DescriptionNoun. Free-hand ellipse Default languageFree-Hand Ellipse In use since2.4 Obsolete since-

tool_fhpath

DescriptionNoun. Pencil tool Default languagePencil Tool In use since2.4 Obsolete since-

tool_fhrect

DescriptionNoun. Free-hand rectangle Default languageFree-Hand Rectangle In use since2.4 Obsolete since-

tool_font_size (was: font_size)

DescriptionVerb. To change the font size of a text element. Default languageChange Font Size In use since2.4 Obsolete since-

tool_group

DescriptionVerb. To group elements Default languageGroup Elements In use since2.4 Obsolete since-

tool_image

DescriptionNoun. Image tool Default languageImage Tool In use since2.4 Obsolete since-

tool_import

DescriptionVerb. To import an SVG file into the image. Default languageImport SVG In use since2.5 Obsolete since-

tool_opacity (was: group_opacity)

DescriptionVerb. To change the opacity of selected items. Default languageChange selected item opacity In use since2.4 Obsolete since-

tool_openclose_path

DescriptionVerb. To make a path or part of a path open or closed Default languageOpen/close sub-path In use since2.5 Obsolete since-

tool_italic

DescriptionAdjective. Italic text Default languageItalic Text In use since2.4 Obsolete since-

tool_line

DescriptionNoun. Line tool Default languageLine Tool In use since2.4 Obsolete since-

tool_move_bottom

DescriptionVerb. To move (the selected element) to the bottom Default languageMove to Bottom In use since2.4 Obsolete since-

tool_move_top

DescriptionVerb. To move (the selected element) to the top Default languageMove to Top In use since2.4 Obsolete since-

tool_node_clone

DescriptionVerb. To clone a node Default languageClone Node In use since2.4 Obsolete since-

tool_node_delete

DescriptionVerb. To delete a node Default languageDelete Node In use since2.4 Obsolete since-

tool_node_link

DescriptionVerb. To link control points: to make the two handles of a node move together, with solidarity, instead of individually. Default languageLink Control Points In use since2.4 Obsolete since-

tool_open

DescriptionVerb. To open an image Default languageOpen Image In use since2.4 Obsolete since-

tool_path

DescriptionNoun. Path tool. The chosen word musn't mean Polygon. Default languagePath Tool In use since2.3 Obsolete since2.4

tool_position

DescriptionVerb. To align a single element in reference to the page Default languageAlign Element to Page In use since2.5 Obsolete since-

tool_rect

DescriptionNoun. Rectangle Default languageRectangle In use since2.4 Obsolete since-

tool_redo

DescriptionVerb. To redo Default languageRedo In use since2.4 Obsolete since-

tool_reorient

DescriptionVerb. (to) Reorient (a) path: For a previously rotated object, make its bounding box parallel to the canvas, and with a rotation angle of 0°. Resets the bounding box origin. Default languageReorient path In use since2.4 Obsolete since-

tool_save

DescriptionVerb. To save the image Default languageSave Image In use since2.4 Obsolete since-

tool_select

DescriptionNoun. Select (selection) tool Default languageSelect Tool In use since2.4 Obsolete since-

tool_source

DescriptionVerb. To edit the source (opens the source editor) Default languageEdit Source In use since2.4 Obsolete since-

tool_source_cancel

DescriptionVerb. To cancel, discard changes. Default languageCancel In use since2.4 Obsolete since-

tool_source_save

DescriptionVerb. (to) Apply changes, accept changes. (does not mean "Save") Default languageApply Changes In use since2.4 Obsolete since-

tool_square

DescriptionNoun. Square Default languageSquare In use since2.4 Obsolete since-

tool_text

DescriptionNoun. Text tool Default languageText Tool In use since2.4 Obsolete since-

tool_topath

DescriptionVerb. To convert (a regular shape, circle, ellipse, rectangle...) in a path (with editable segments) Default languageConvert to Path In use since2.4 Obsolete since-

tool_undo

DescriptionVerb. To undo Default languageUndo In use since2.4 Obsolete since-

tool_ungroup

DescriptionVerb. To ungroup elements (previously grouped) Default languageUngroup Elements In use since2.4 Obsolete since-

tool_wireframe

DescriptionNoun. Wireframe, outline mode (shows the outline of the elements, with no colors) Default languageWireframe Mode In use since2.4 Obsolete since-

tool_zoom

DescriptionNoun. Zoom tool Default languageZoom Tool In use since2.4 Obsolete since-

tools_ellipse_show

DescriptionNoun. Ellipse/Circle tool Default languageEllipse/Circle Tool In use since2.4 Obsolete since2.5 r1333

tools_rect_show

DescriptionNoun. Square/Rectangle tool Default languageSquare/Rect Tool In use since2.4 Obsolete since2.5 r1333

url_notice

DescriptionSentence. Notice given to indicate the raster image cannot be embedded and depends on the given path to appear Default languageNOTE: This image cannot be embedded. It will depend on this path to be displayed In use since2.5 Obsolete since-

zoom_panel (was: zoom)

DescriptionVerb. To change the zoom level Default languageChange zoom level In use since2.5 Obsolete since-

zoomLabel

DescriptionNoun. Zoom: Default languagezoom: In use since2.4 Obsolete since2.5

sidepanel_handle

DescriptionVerb, then Noun. To drag left/right (in order) to resize the side panel, then, L a y e r s. Default languageDrag left/right to resize side panel Default languageL a y e r s In use since2.4 Obsolete since-
JavaScript strings (js_strings)

QerrorsRevertToSource

DescriptionSentence. States that there were errors while parsing the manually given SVG source code. Asks if it should go back to the original code. Default languageThere were parsing errors in your SVG source.\nRevert back to original SVG source? In use since2.4 Obsolete since-

QignoreSourceChanges

DescriptionSentence. Verifies that the changes made to the SVG source code can be rolled back. Default languageIgnore changes made to SVG source? In use since2.4 Obsolete since-

QmoveElemsToLayer

DescriptionSentence. Verifies that the selected items must be moved to another (already specified) layer. ('%s' must not be translated or changed.) Default languageMove selected elements to layer '%s'? In use since2.4 Obsolete since-

QwantToClear

DescriptionSentence. Verifies if the entire drawing, including the undo history, should be discarded. Default languageDo you want to clear the drawing?\nThis will also erase your undo history! In use since2.4 Obsolete since-

cancel

DescriptionVerb. Cancels a given command and returns back to the state before that. Default languageCancel In use since2.4 Obsolete since-

dupeLayerName

DescriptionSentence. Is displayed if a layer is created with a name of an already existing layer. Default languageThere is already a layer named that! In use since2.4 Obsolete since-

enterNewImgURL

DescriptionVerb. Lets you edit the URL of an inserted image. Default languageEnter the new image URL In use since2.4 Obsolete since-

enterNewLayerName

DescriptionSentence. Asks for a new layer name. A layer name identifies a layer. Default languagePlease enter the new layer name In use since2.4 Obsolete since-

enterUniqueLayerName

DescriptionSentence. Asks for a unique layer name. Default languagePlease enter a unique layer name In use since2.4 Obsolete since-

featNotSupported

DescriptionNoun. States that a function is not supported. Default languageFeature not supported In use since2.4 Obsolete since-

invalidAttrValGiven

DescriptionAdjective. States that a given value is not correct. Eg some text is given while a number is required. Default languageInvalid value given In use since2.4 Obsolete since-

defsFailOnSave

DescriptionSentence. Provides a message for Firefox users indicating that gradients, markers, etc will not appear as expected when saving. Default languageNOTE: Due to a bug in your browser, this image may appear wrong (missing gradients or elements). It will however appear correct once actually saved. In use since2.5 Obsolete since-

loadingImage

DescriptionSentence. Text that briefly appears on the page when the "Export" option is chosen Default languageLoading image, please wait... In use since2.5 Obsolete since-

saveFromBrowser

DescriptionSentence. Text that appears in popup on the new window with a SVG or image (%s = PNG, JPEG, BMP, WEBP, SVG) Default languageSelect \"Save As...\" in your browser to save this image as a %s file. In use since2.5 Obsolete since-

noteTheseIssues

DescriptionSentence. On "Export", the prefix text to indicate there are issues. Default languageAlso note the following issues: In use since2.5 Obsolete since-

key_backspace

DescriptionNoun. Name of the keyboard key: backspace Default languagebackspace In use since2.4 Obsolete since-

key_del

DescriptionNoun. Name of the keyboard key: delete Default languagedelete In use since2.4 Obsolete since-

key_down

DescriptionNoun. Name of the keyboard key: down Default languagedown In use since2.4 Obsolete since-

key_up

DescriptionNoun. Name of the keyboard key: up Default languageup In use since2.4 Obsolete since-

layer

DescriptionNoun. Gives the name for a layer. An image can have multiple layers that can group a number of elements. Default languageLayer In use since2.4 Obsolete since-

layerHasThatName

DescriptionSentence. States that the new layer name is the same as the old layer name. Default languageLayer already has that name In use since2.4 Obsolete since-

noContentToFitTo

DescriptionSentence. States that the command to resize the canvas to all content could not be executed, because there is no content. Default languageNo content to fit to In use since2.4 Obsolete since-

ok

DescriptionNoun. Executes the action and commits the changes that have been made. Default languageOK In use since2.4 Obsolete since-

pathCtrlPtTooltip

DescriptionVerb. States that the point that is being hovered can be dragged elsewhere. This will change the curve of the matching line. Default languageDrag control point to adjust curve properties In use since2.4 Obsolete since-

pathNodeTooltip

DescriptionVerb. States that the point that is being hovered can be dragged elsewhere. This will change the shape. The point can also be double-clicked, which will change the matching line type. Default languageDrag node to move it. Double-click node to change segment type In use since2.4 Obsolete since-

exportNoBlur

DescriptionSentence. Note that blur is not supported on image export Default languageBlurred elements will appear as un-blurred In use since2.5 Obsolete since-

exportNoImage

DescriptionSentence. Note that Image elements are not supported on image export Default languageImage elements will not appear In use since2.5 Obsolete since-

exportNoforeignObject

DescriptionSentence. Note that foreignObject elements are not supported on image export Default languageforeignObject elements will not appear In use since2.5 Obsolete since-

exportNoDashArray

DescriptionSentence. Note that stroke-dasharray is not supported on image export (will appear as regular stroke instead) Default languageStrokes will appear filled In use since2.5 Obsolete since-

exportNoText

DescriptionSentence. Note that text is not supported on image export (will only appear in browsers that don't support Canvas Text API) Default languageText may not appear as expected In use since2.5 Obsolete since- 
