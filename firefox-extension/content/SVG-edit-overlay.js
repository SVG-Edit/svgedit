function start_svg_edit() {
    var url = "chrome://SVG-edit/content/editor/svg-editor.html";

    window.openDialog(url, "SVG Editor",
		      "width=1024,height=700,menubar=no,toolbar=no");
}
