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
	$filename = (isset($_POST['filename']) && !empty($_POST['filename']) ? preg_replace('@[\\\\/:*?"<>|]@u', '_', $_POST['filename']) : 'saved') . '.svg'; // These characters are indicated as prohibited by Windows

	$fh = fopen($filename, 'w') or die("Can't open file");
	fwrite($fh, $svg);
	fclose($fh);
?>
