<?php
/*
 * filesave.php
 * To be used with ext-server_opensave.js for SVG-edit
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2010 Alexis Deveria
 *
 */

$allowedMimeTypesBySuffix = array(
    'svg' => 'image/svg+xml',
    'png' => 'image/png',
    'jpeg' => 'image/jpeg',
    'bmp' => 'image/bmp',
    'webp' => 'image/webp'
);

$mime = !isset($_POST['mime']) || !in_array($_POST['mime'], $allowedMimeTypesBySuffix) ? 'image/svg+xml' : $_POST['mime'];
 
if (!isset($_POST['output_svg']) && !isset($_POST['output_img'])) {
	die('post fail');
}

$file = '';

$suffix = '.' . array_search($mime, $allowedMimeTypesBySuffix);

if (isset($_POST['filename']) && strlen($_POST['filename']) > 0) {
	$file = $_POST['filename'] . $suffix;
} else {
	$file = 'image' . $suffix;
}

if ($suffix == '.svg') {
	$contents = rawurldecode($_POST['output_svg']);
} else {
	$contents = $_POST['output_img'];
	$pos = (strpos($contents, 'base64,') + 7);
	$contents = base64_decode(substr($contents, $pos));
}

 header("Cache-Control: public");
 header("Content-Description: File Transfer");
 header("Content-Disposition: attachment; filename=" . $file);
 header("Content-Type: " .  $mime);
 header("Content-Transfer-Encoding: binary");
 
 echo $contents;
 
?>