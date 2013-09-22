<?php
$svg = <<<'my_raster_test'
<?xml version="1.0" ?>
<svg width="607.06201" height="395.60501" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
 <style type="text/css">
  <![CDATA[
   text {font-family: Helvetica, Arial, sans-serif; font-size: 100px}
   .smalltext {font-size: 75px}
]]>
 </style>

 <g>
  <title>Layer 1</title>
  <g id="svg_1">
   <polygon id="svg_2" points="360.2910461425781,122.3558120727539 366.2970275878906,128.3568115234375 337.7910461425781,156.3548126220703 332.29302978515625,150.8568115234375 360.2910461425781,122.3558120727539 "/>
   <polygon id="svg_3" points="241.7900390625,252.35580444335938 236.2920379638672,246.85781860351562 264.7930450439453,218.351806640625 270.2910461425781,223.8598175048828 241.7900390625,252.35580444335938 "/>
   <polygon id="svg_4" points="369.2950439453125,246.3598175048828 363.2900390625,252.35580444335938 335.2910461425781,223.8598175048828 340.7900390625,218.351806640625 369.2950439453125,246.3598175048828 "/>
   <rect id="svg_5" transform="matrix(-0.7074, 0.7068, -0.7068, -0.7074, 432.792, 25.4538)" y="24.0175" x="201.47566" height="40.306" width="8"/>
   <text id="svg_6" y="224.85551" x="266.28804">C</text>
   <text id="svg_7" y="122.85161" x="369.28954">NO</text>
   <text id="svg_8" class="smalltext" y="141.59621" x="519.30614">2</text>
   <text id="svg_9" y="122.85161" x="45.16602">O</text>
   <text id="svg_10" class="smalltext" y="141.59621" x="122.97314">2</text>
   <text id="svg_11" y="122.85161" x="164.68064">N</text>
   <text id="svg_12" y="326.85891" x="45.16602">O</text>
   <text id="svg_13" class="smalltext" y="345.60501" x="122.97314">2</text>
   <text id="svg_14" y="326.85891" x="164.68064">N</text>
   <text id="svg_15" y="326.85891" x="369.28954">NO</text>
   <text id="svg_16" class="smalltext" y="345.60501" x="519.30614">2</text>
  </g>
 </g>
</svg>
my_raster_test;

//$svg = pack("CCC", 0xef, 0xbb, 0xbf) . $svg;


//$svg = file_get_contents("big.svg");

require_once('helper-functions.php');

$png = SvgToPng($svg);
/*
$db = new mysqli("localhost", "www", "", "svg-edit-test");
if($db->connect_errno)
{
	applog("Couldn't connect to database: " . $db->connect_error);
	die();
}

$null = NULL; $test = "test"; $num = 1;
$stmt = $db->prepare("INSERT INTO Tests(commonsName, svgIsValid, svg, canonicalSvg, nodeCount, attrCount, png) VALUES(?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sissiib", $test, $num, $svg, $test, $num, $num, $null);

$stmt->send_long_data(6, $png);
$stmt->execute();
$stmt->execute();

die();
*/
if($png)
{
	header("Content-Type: image/png");
	echo $png;
} else {
	echo "no png for you";
} 