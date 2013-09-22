<?php
$db = new mysqli("localhost", "www", "", "svg-edit-test");
if($db->connect_errno)
{
	applog("Couldn't connect to database: " . $db->connect_error);
	die();
}

$updateStmt = $db->prepare("UPDATE Tests SET attrsList = ? WHERE svgId = ?");
$tests = $db->query("SELECT svgId, svg FROM Tests");

while($test = $tests->fetch_assoc())
{
	$svgdoc = new DOMDocument();
	@$svgdoc->loadXML($test["svg"]);
	
	$attrSearch = new DOMXPath($svgdoc);
	$attrs = $attrSearch->query("//@*");
	$attrsList = array();
	foreach($attrs as $attr)
	{
		$attrsList[] = $attr->nodeName;
	}
	$attrsList = array_unique($attrsList);
	sort($attrsList);
	
	// update list in db
	$updateStmt->bind_param("si", implode(", ", $attrsList), $test["svgId"]);
	$updateStmt->execute();
}

$updateStmt->close();