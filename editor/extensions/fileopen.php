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
	
	$file = $_FILES['svg_file']['tmp_name'];
	
	$output = file_get_contents($file);
	
	$type = $_REQUEST['type'];
	
	$prefix = '';
	
	// Make Data URL prefix for import image
	if($type == 'import_img') {
		$info = getimagesize($file);
		$prefix = 'data:' . $info['mime'] . ';base64,';
	}
?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<script>
window.top.window.svgEditor.processFile("<?php echo $prefix . base64_encode($output); ?>", "<?php echo htmlentities($type); ?>");
</script>
</head><body></body>
</html>
