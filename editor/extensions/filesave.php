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

function encodeRFC5987ValueChars ($str) {
	// See http://tools.ietf.org/html/rfc5987#section-3.2.1
	// For better readability within headers, add back the characters escaped by rawurlencode but still allowable
	// Although RFC3986 reserves "!" (%21), RFC5987 does not
	return preg_replace_callback('@%(2[1346B]|5E|60|7C)@', function ($matches) {
		return chr('0x' . $matches[1]);
	}, rawurlencode($str));
}

require('allowedMimeTypes.php');

$mime = !isset($_POST['mime']) || !in_array($_POST['mime'], $allowedMimeTypesBySuffix) ? 'image/svg+xml;charset=UTF-8' : $_POST['mime'];
 
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
	$contents = $_POST['output_svg'];
} else {
	$contents = $_POST['output_img'];
	$pos = (strpos($contents, 'base64,') + 7);
	$contents = base64_decode(substr($contents, $pos));
}

header("Cache-Control: public");
header("Content-Description: File Transfer");

// See http://tools.ietf.org/html/rfc6266#section-4.1
header("Content-Disposition: attachment; filename*=UTF-8''" . encodeRFC5987ValueChars(
	// preg_replace('@[\\\\/:*?"<>|]@', '', $file) // If we wanted to strip Windows-disallowed characters server-side (but not a security issue, so we can strip client-side instead)
	$file
));
header("Content-Type: " .  $mime);
header("Content-Transfer-Encoding: binary");

echo $contents;
 
?>