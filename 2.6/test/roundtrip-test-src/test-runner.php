<?php
$dbhost = "localhost";
$dbuser = "www";
$dbpass = "";
$dbschema = "svg-edit-test";

if(@$_GET["testfetch"] == "1")
{
	header("Cache-Control: no-store");
	$db = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);
	if($db->connect_errno)
	{
		echo ("Couldn't connect to database: " . $db->connect_error);
		die();
	}

	$qr = $db->query("
		SELECT T.svgId, T.svg 
		FROM `svg-edit-test`.Tests T
		LEFT JOIN `svg-edit-test`.TestResults TR ON T.svgId = TR.svgId AND TR.svnRev = " . $db->real_escape_string($_GET["rev"]) . " AND TR.browser = '" . $db->real_escape_string($_GET["browser"]) . "' AND TR.browserMajorVer = " . $db->real_escape_string($_GET["browserMajorVer"]) .  "
		WHERE TR.svgId IS NULL
		LIMIT 1 ");
	
	if($db->errno)
	{
		echo $db->error;
		exit;
	}
	
	if($qr->num_rows)
	{
		$json = $qr->fetch_assoc();		
	} else {
		$json = array("svgId" => -1);
	}

	echo json_encode($json);
	
	exit;
} else if(@$_GET["teststore"] == 1){
	set_time_limit(0);
	require_once('helper-functions.php');

	function testStoreFail($comment)
	{
		header("HTTP/1.1 500 Internal Server Error");
		echo $comment;
		error_log("svg-edit-test store: " . $comment);
		exit;
	}	
	
	$db = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);
	if($db->connect_errno)
	{
		echo ("Couldn't connect to database: " . $db->connect_error);
		die();
	}
	
	function e($name)
	{
		global $db;
		return $db->real_escape_string($_POST[$name]);
	}	

	$svg = $_POST["svg"];
	
	$isValid = testSvgStrictValidity($svg);
	//error_log("isValid");
	$canonicalXML = XmlCanonicalize($svg);
	//error_log("canonicalized");
	
	$svgdoc = new DOMDocument();
	@$svgdoc->loadXML($svg);
	//error_log("DOM-ized");
	
	$attrSearch = new DOMXPath($svgdoc);
	$attrs = $attrSearch->query("//@*");
	$attrCount = $attrs->length;	
	
	$nodeSearch = new DOMXPath($svgdoc);
	$nodes = $nodeSearch->query("//node()");
	$nodeCount = $nodes->length;
	
	//error_log("attr & node counts");
	
	// get comparison data from original
	$r = $db->query("SELECT attrsList, png FROM Tests WHERE svgId = " . e("svgId"))->fetch_assoc();
	$origAttrs = explode(", ", $r["attrsList"]);
	
	//error_log("orig data fetched");

	$IM_orig = new Imagick();
	$IM_orig->readimageblob($r["png"]);
	//error_log("orig data to wand");
	$r["png"] = "";	
	
	// attrsLostList
	$attrsList = array();
	foreach($attrs as $attr)
	{
		$attrsList[] = $attr->nodeName;
	}
	$attrsList = array_unique($attrsList);
	$attrsLost = array_diff($origAttrs, $attrsList);
	sort($attrsLost);
	
	// png
	$png = NULL;
	try {
		if(substr(ltrim($_POST["svg"]), 0, 3) != "<?xml")
		{
			$png = SvgToPng("<?xml version=\"1.0\" ?>" . $_POST["svg"]);
		} else {
			$png = SvgToPng($_POST["svg"]);
		}
		
		// png diff
		$IM_test = new IMagick();
		$IM_test->readimageblob($png);
		$img_diff = $IM_orig->compareImages($IM_test, Imagick::METRIC_MEANSQUAREERROR);
	} catch(ImagickException $e)
	{
		applog("Rasterizing error on test " . $_POST["svgId"] . ": " . $e->getMessage());
		$png = ""; // allow further testing to proceed in this error condition (don't send HTTP 500)
		$img_diff = array(0=>"", 1=>1);
	}
	
	$null = NULL;
	
	$stmt = $db->prepare("INSERT INTO `svg-edit-test`.TestResults (svgId, browser, browserMajorVer, browserVer, svnRev, svg, svgIsValid, canonicalSvg, nodeCount, attrCount, attrsLostList, png, pngdiff, rasterDiffMeanSquareError)
			VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)
		");
	
	if($db->errno)
	{
		testStoreFail("PREPARE failed: " . $db->error);
	}
	
	if($stmt->bind_param("isisibibiisbbd", $_POST["svgId"], $_POST["browser"], $_POST["browserMajorVer"], $_POST["browserVer"], $_GET["rev"], $null, $isValid, $null,
			$nodeCount, $attrCount, implode(", ", $attrsLost), $null, $null, $img_diff[1]))
	{
		send_long_data_helper($stmt, 5, $_POST["svg"]);
		send_long_data_helper($stmt, 7, $canonicalXML);
		send_long_data_helper($stmt, 11, $png);
		send_long_data_helper($stmt, 12, $img_diff[0]);

		$stmt->execute();
		if($db->errno)
		{
			testStoreFail("INSERT failed. Errno " . $db->errno . ": " . $db->error);
			$stmt->close();			
		}
		$stmt->close();		
	} else {
		testStoreFail("Parameterizing input");
	}
	
	exit;
} else if(@!$_GET["rev"])
{
	header("Location: launcher.php");
	exit();
}
$rev = $_GET["rev"];
?>
<!DOCTYPE html>
<html>
<head>
<title>svg-edit round-trip tester</title>
<script src="<?php echo ("http://home.mbaynton.com/svg-edit-test/svg-edit-test/svn/checkout.php/$rev/editor/embedapi.js"); ?>"></script>
<script src="browser-detection.js"></script>
</head>
<body>
	<table>
		<tr>
			<td style="vertical-align: top;"><iframe id="svg-edit-frame" src="<?php echo ("http://home.mbaynton.com/svg-edit-test/svg-edit-test/svn/checkout.php/$rev/editor/svg-editor.html"); ?>" width=1024 height=768></iframe></td>
			<td style="vertical-align: top;"><ul id="test-results"></ul></td>			
		</tr>
	</table>
	<script src="app.js"></script>		
</body>
</html>