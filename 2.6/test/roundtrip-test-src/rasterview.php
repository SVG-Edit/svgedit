<?php
require_once 'settings.php';

$db = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);
?><!DOCTYPE HTML>
<html>
<head>
	<title>SVG Rasterization viewer</title>
	<style>
    /* Generic pane rules */
    body { margin: 0; }
    .row, .col { overflow: hidden; position: absolute; }
    .row { left: 0; right: 0; }
    .col { top: 0; bottom: 0; }
    .scroll-x { overflow-x: auto; }
    .scroll-y { overflow-y: auto; }

    .body.row { top: 68px; bottom: 0px; }
    .header.row { height: 68px; width: 100%; top: 0; background-color: #ccc;}
    .header.row .float {display: block;}
    .header.row .float.left {float: left; width: 50%;}
    .header.row .float.right {float: right; width: 50%;}
    
	.diffPanel {
	    background-color: #FFFFFF;
	    width: 50%;
	    height: 100%;
	    overflow: scroll; 
	}
	</style>
	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.1/jquery.min.js"></script>
	<script>
	function setTest(test)
	{
		if(typeof test == "string")
		{
			$("#direction").val(test);
		} else {
			$("#direction").val("");
		}
		$("#setTest").submit();		
	}		
	</script>
</head>
<?php 
$svgId = (int)$_GET["svgId"];
if($svgId == 0)
{
	$r = $db->query("SELECT svgId FROM Tests ORDER BY svgId LIMIT 1");
	$svgId = $r->fetch_assoc();
	$svgId = $svgId["svgId"];
}

$d = $_GET["direction"];
if($d)
{
	if($d == "next")
	{
		$r = $db->query("SELECT svgId FROM Tests WHERE svgId > $svgId ORDER BY svgId LIMIT 1");
	} else if ($d == "prev")
	{
		$r = $db->query("SELECT svgId FROM Tests WHERE svgId < $svgId ORDER BY svgId DESC LIMIT 1");
	}
	if($r && $r->num_rows)
	{
		$svgId = $r->fetch_assoc();
		$svgId = $svgId["svgId"];
	}
}

// get results
$r = $db->query("SELECT commonsName FROM Tests WHERE svgId = $svgId");
$commonsName = $r->fetch_assoc();
$commonsName = $commonsName["commonsName"];

$r = $db->query("SELECT browser, browserMajorVer, svnRev, resultId FROM TestResults WHERE svgId = $svgId ORDER BY svnRev DESC, browser, browserMajorVer DESC");
$compare_options = "";
while($opt = $r->fetch_assoc())
{
	$compare_options .= "<option value=\"" . $opt["resultId"] . "\">r" . $opt["svnRev"] . " on " . $opt["browser"] . " " . $opt["browserMajorVer"] . "</option>";
}
?>
<body>
	<form id="setTest" method="get">
		<input id="direction" name="direction" type="hidden" value="" />
	    <div class="header row">
	    	<div class="float left">Test image: <a href="javascript:setTest('prev')">&lt;&lt;</a> <input id="svgId" name="svgId" type="text" size="4" onchange="setTest(this.value*1)" value="<?php echo $svgId; ?>" /> <a href="javascript:setTest('next')">&gt;&gt;</a></div><div class="float right">Compare with: 
	    		<select size="1" id="resultId" onchange="setComparison()"><?php echo $compare_options; ?></select>
	    	</div>
	    	<div style="height: 1px; width: 100%; clear: both"></div>
	    	<div class="float" style="white-space: nowrap"><?php  echo $commonsName ?></div>
	      	<div class="float left">Original</div><div class="float right">Changed</div>
	    </div>
	</form>    
	<div id="outputDiv" class="body row scroll-y">
		<div class="diffPanel" style="float:left;"><img src="img-fetch.php?svgId=<?php echo $svgId ?>"></div>
		 <div class="diffPanel" style="float:right;"><img id="resultImg" /></div>
	</div>
	
	<script>
		function setComparison()
		{
			var resultId = $("#resultId").val();
			document.getElementById("resultImg").src = "img-fetch.php?resultId=" + resultId;
		}

		setComparison();

		// sync scrolling
		$(outputDiv).find(".diffPanel").scroll(function(evt){
			// find companion div
			var companion = $(evt.target).parent().find(".diffPanel").filter(function(){return this !== evt.target});
			companion.scrollLeft($(evt.target).scrollLeft());
			companion.scrollTop($(evt.target).scrollTop());
		})		
	</script>
</body>
</html>
