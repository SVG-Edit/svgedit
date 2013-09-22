<?php
	//echo svn_cat("http://svg-edit.googlecode.com/svn/trunk/editor/recalculate.js", 2459) 
	$uri_parts = explode("/", $_SERVER["REQUEST_URI"]);
	$thisfile = pathinfo(__FILE__);
	$thisfile = $thisfile["basename"];
	
	$thisFileIx = -1;
	foreach($uri_parts as $ix => $part)
	{
		if($part == $thisfile)
		{
			$thisFileIx = $ix;
			break;			
		}
	}
	
	if($thisFileIx == -1) die();
	
	$rev = $uri_parts[$thisFileIx + 1];
	$path_parts = array_slice($uri_parts, $thisFileIx + 2);
	$path = join("/", $path_parts);
	
	
	$source = svn_cat("http://svg-edit.googlecode.com/svn/trunk/$path", $rev);
	
	if($source)
	{
		$exts = array("js" => "text/javascript", "svg" => "text/svg", "xml" => "text/xml", "css" => "text/css");
		$pathinfo = pathinfo($path);
		$mime = @$exts[$pathinfo["extension"]];
		
		if(!$mime)
		{
			$magic = new finfo(FILEINFO_MIME);
			$mime = $magic->buffer($source);
		}
		
		if($mime)
		{
			header("Content-Type: $mime");
		}
		
		echo $source;
	}
?>