<?php 
require_once 'settings.php';

$db = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);

if(@$_GET["svgId"])
{
	$svgId = (int)$_GET["svgId"];
	$r = $db->query("SELECT png FROM Tests WHERE svgId = $svgId");
	$png = $r->fetch_assoc();
	$png = $png["png"];
} else if(@$_GET["resultId"])
{
	$resultId = (int)$_GET["resultId"];
	$r = $db->query("SELECT pngdiff FROM TestResults WHERE resultId = $resultId");
	$png = $r->fetch_assoc();
	$png = $png["pngdiff"];
}

header("Content-Type: image/png");
echo $png;
?>