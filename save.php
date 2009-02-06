<?php
$svg= $_REQUEST["svg_data"];
/*
echo $svg;
echo "</br>"
echo urldecode($svg);
$svg_data_to_display_for_html= htmlspecialchars(urldecode($svg));
echo $svg_data_to_display_for_html ;
*/
 
$svg_data= urldecode($svg);
$file = "sig.svg";
$fh = fopen($file, "w") or die("Can't open file");
fwrite($fh, $svg_data);
fclose($fh);
?>
