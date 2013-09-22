<?php
$dbhost = "localhost";
$dbuser = "www";
$dbpass = "";
$dbschema = "svg-edit-test";

$db = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);
?><!DOCTYPE HTML>
<html>
<head>
	<title>Canonical XML diff viewer</title>
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
	
	#outputDiv { white-space: nowrap; font-family: courier; font-size: 10pt; }
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

	var diffWorker;
	var workerRunning = false;
	function resetWorker()
	{
		if(diffWorker)
		{
			diffWorker.terminate();
		}
		
		diffWorker = new Worker("diff_match_patch_htmlsidebyside-worker.js");
		diffWorker.onmessage = function(oEvent)
		{
			workerRunning = false;
			$("#outputDiv").html(oEvent.data);
			
			// sync scrolling
			$(outputDiv).find(".diffPanel").scroll(function(evt){
				// find companion div
				var companion = $(evt.target).parent().find(".diffPanel").filter(function(){return this !== evt.target});
				companion.scrollLeft($(evt.target).scrollLeft());
				companion.scrollTop($(evt.target).scrollTop());
			})
		}		
	}
	resetWorker();
		
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
$r = $db->query("SELECT canonicalSvg FROM Tests WHERE svgId = $svgId");
$orig_svg = $r->fetch_assoc();
$orig_svg = $orig_svg["canonicalSvg"];

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
	    	<div class="float" style="white-space: nowrap">Attributes lost: <del style="background:#ffe6e6;" id="attrsLostList"></del></div>
	      	<div class="float left">Original</div><div class="float right">Changed</div>
	    </div>
	</form>    
	<div id="outputDiv" class="body row scroll-y"></div>
	
	<script>
		var orig_svg = <?php echo json_encode($orig_svg) ?>;
	
		function setComparison()
		{
			var resultId = $("#resultId").val();
			if(workerRunning)
			{
				resetWorker();
			}
			
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function()
			{
				if(xhr.readyState == 4)
				{
					if(xhr.status == 200)
					{
						responseObj = JSON.parse(xhr.responseText);
						diffWorker.postMessage({orig: orig_svg, changed: responseObj.canonicalSvg});
						workerRunning = true;
						$("#attrsLostList").html(responseObj.attrsLostList);
						$("#outputDiv").html("Please wait, diff is being computed. Performance may be blamed on <a target=\"_blank\" href=\"http://code.google.com/p/google-diff-match-patch/\">google-diff-match-patch</a> ;)");
					}
				}
			}
			xhr.open("GET", "resultsvg.php?resultId=" + resultId);
			xhr.send();
			$("#outputDiv").html("Please wait, fetching document");
		}

		setComparison();
	</script>
</body>
</html>
