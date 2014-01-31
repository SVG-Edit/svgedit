<?php
	// You must first create a file "savefile_config.php" in this extensions directory and do whatever
	//   checking of user credentials, etc. that you wish; otherwise anyone will be able to post SVG
	//   files to your server which may cause disk space or possibly security problems
  require('savefile_config.php');
  if (!isset($_POST['output_svg'])) {
		print "You must supply output_svg";
		exit;
	}
	$svg = $_POST['output_svg'];
	$filename = (isset($_POST['filename']) && !empty($_POST['filename']) ? preg_replace('@[\\\\/:*?"<>|]@', '_', urldecode($_POST['filename'])) : 'saved') . '.svg'; // These characters are indicated as prohibited by Windows
	$output_svg = urldecode($svg);
	$file = $filename;
	$fh = fopen($file, 'w') or die("Can't open file");
	fwrite($fh, $output_svg);
	fclose($fh);
?>
