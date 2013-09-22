<?php
require_once 'settings.php';
require_once('helper-functions.php');

if(count(@$argv) > 1)
{
	$tests_to_generate = $argv[1];
} else {
	$tests_to_generate = 1;
}
$tests_generated = 0;

$db = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);
if($db->connect_errno)
{
	applog("Couldn't connect to database: " . $db->connect_error);
	die();
}

$checkstmt = $db->prepare("SELECT svgId FROM Tests WHERE commonsName = ?");
$stmt = $db->prepare("INSERT INTO Tests(commonsName, svgIsValid, svg, canonicalSvg, nodeCount, attrCount, png, attrsList) VALUES(?, ?, ?, ?, ?, ?, ?, ?)");

while($tests_generated < $tests_to_generate)
{
	$svgStruct = fetchRandomSvg();
	applog("Processing \"" . $svgStruct["title"] . "\"...");
	
	// check for the improbable
	$checkstmt->bind_param("s", $svgStruct["title"]);
	$checkstmt->execute();
	$checkstmt->store_result();
	if($checkstmt->num_rows == 1)
	{
		$checkstmt->free_result();
		applog("Encountered an svg that was already processed: " . $svgStruct["title"]);
		continue;		
	}
	$checkstmt->free_result();
	
	$svg = $svgStruct["svg"];
	
	if(strlen($svg) > 16777215)
	{
		applog("Not using - svg markup is insanely large");
		continue;
	}
	
	$isValid = testSvgStrictValidity($svg);
	
	$canonicalXML = XmlCanonicalize($svg);	

	if(strlen($canonicalXML) > 16777215)
	{
		applog("Not using - canonicalized markup is insanely large");
		continue;
	}	
	
	$svgdoc = new DOMDocument();
	@$svgdoc->loadXML($svg);
	
	$attrSearch = new DOMXPath($svgdoc);
	$attrs = $attrSearch->query("//@*");
	$attrCount = $attrs->length;
	$attrsList = array();
	foreach($attrs as $attr)
	{
		$attrsList[] = $attr->nodeName;
	}
	$attrsList = array_unique($attrsList);
	sort($attrsList);
	
	$nodeSearch = new DOMXPath($svgdoc);
	$nodes = $nodeSearch->query("//node()");
	$nodeCount = $nodes->length;
	
	$png = NULL;
	try {
		$png = SvgToPng($svg);
	} catch(ImagickException $e)
	{
		applog("Rasterizing error: " . $e->getMessage());
		continue;
	}
	$null = NULL;
	
	if(strlen($png) > 16777215)
	{
		applog("Not using - rasterized png is insanely large");
		continue;
	}

	if(!$stmt->bind_param("sissiibs", $svgStruct["title"], $isValid, $null, $null, $nodeCount, $attrCount, $null, implode(", ", $attrsList)))
	{
		applog("Binding parameters of test failed: (" . $stmt->errno . ") " . $stmt->error);
		continue;
	} else {
		send_long_data_helper($stmt, 2, $svg);
		send_long_data_helper($stmt, 3, $canonicalXML);
		send_long_data_helper($stmt, 6, $png);

		if(!$stmt->execute())
		{
			applog("Storing test failed: (" . $stmt->errno . ") " . $stmt->error);
		}
	}
	
	$tests_generated++;
	usleep(500 * 1000); // .5 sec
}

$checkstmt->close();
$stmt->close();
