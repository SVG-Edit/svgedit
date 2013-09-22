<?php
$dbhost = "localhost";
$dbuser = "www";
$dbpass = "";
$dbschema = "svg-edit-test";

function get_revs()
{
	$revs = array();
	
	$doc = new DOMDocument();
	@$doc->loadHTMLFile("http://code.google.com/p/svg-edit/source/list");
	
	$revRowSearcher = new DOMXPath($doc);
	$revRows = $revRowSearcher->query("//td[@nowrap = 'nowrap']/a[substring(@href, 1, 9) = 'detail?r=']");
	for($i = 0; $i < $revRows->length; $i++)
	{
		$rev = array(
				"r" => substr($revRows->item($i)->attributes->getNamedItem("href")->nodeValue, 9),
				"date" => $revRows->item($i)->nodeValue
			);
		$revs[] = $rev;
	}
	
	return $revs;
}

// get results stats
$mysqli = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);
$mysqli->query("SELECT browser, browserMajorVer, svnRev, SUM(rasterDiffMeanSquareError) AS sum, COUNT(rasterDiffMeanSquareError) AS count FROM TestResults 
GROUP BY browser, browserMajorVer, svnRev
ORDER BY CASE WHEN COUNT(rasterDiffMeanSquareError) = 300 THEN 1 ELSE 2 END, svnRev DESC, browser, browserMajorVer DESC", MYSQLI_ASYNC);

$revs = get_revs();

$result = $mysqli->reap_async_query();
?>
<html>
<head>
	<title>svg-edit round-trip test launcher</title>
</head>
<body>
	<h2>Donate this browser to running tests:</h2>
	<form action="test-runner.php" method="GET">
	Revision to test: <select size="1" name="rev">
	<?php 
	foreach($revs as $rev)
	{
		$r = $rev["r"];
		$date = $rev["date"];
		echo ("<option value=\"$r\">$r - $date</option>");
	}
	?>
	</select>
	<input type="submit" value="Go!" />
	</form>
	<h2>Results:</h2>
	<p><strong>Raster Error Score summary</strong>
	<table border="1">
	<tr><th rowspan="2">Revision</th><th colspan="2">Browser</th><th rowspan="2">Error Score</th></tr>
	<tr><th>Name</th><th>Version</th></tr>
	<?php 
	while($resultArray = $result->fetch_assoc())
	{
		echo ("<tr><td>" . $resultArray["svnRev"] . "</td><td>" . $resultArray["browser"] . "</td><td>" . $resultArray["browserMajorVer"] . "</td><td>");
		if($resultArray["count"] == 300){
			echo $resultArray["sum"];
		} else {
			echo "(tests incomplete)";
		}
		echo "</td></tr>";
		
	}?>
	</table>
	</p>
	<p><strong>Detail views</strong>
	<ul>
	<li><a target="_blank" href="rasterview.php">Raster image comparisons</a></li>
	<li><a target="_blank" href="diffview.php">Canonical XML side-by-side diffs</a></li>
	</ul>
	</p>
</body>
</html>