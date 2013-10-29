<!DOCTYPE html>
<?php
/*
 * fileopen.php
 * To be used with ext-server_opensave.js for SVG-edit
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */
	// Very minimal PHP file, all we do is Base64 encode the uploaded file and
	// return it to the editor
	
	$type = $_REQUEST['type'];
	if (!in_array($type, array('load_svg', 'import_svg', 'import_img'))) {
		exit;
	}
	require('allowedMimeTypes.php');
	
	$file = $_FILES['svg_file']['tmp_name'];
	
	$output = file_get_contents($file);
	
	$prefix = '';
	
	// Make Data URL prefix for import image
	if($type == 'import_img') {
		$info = getimagesize($file);
		if (!in_array($info['mime'], $allowedMimeTypesBySuffix)) {
			exit;
		}
		$prefix = 'data:' . $info['mime'] . ';base64,';
	}
?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<script>
window.top.window.svgEditor.processFile("<?php 

// This should be safe since SVG edit does its own filtering (e.g., if an SVG file contains scripts)
echo $prefix . base64_encode($output);

?>", "<?php echo $type; ?>");
</script>
</head><body></body>
</html>
