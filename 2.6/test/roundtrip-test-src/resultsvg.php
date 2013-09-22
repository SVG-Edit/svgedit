<?php 
$dbhost = "localhost";
$dbuser = "www";
$dbpass = "";
$dbschema = "svg-edit-test";

$db = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);

$resultId = (int)$_GET["resultId"];

$r = $db->query("SELECT canonicalSvg, attrsLostList FROM TestResults WHERE resultId = $resultId");
$r = $r->fetch_assoc();

echo json_encode($r);
?>