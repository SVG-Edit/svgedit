<?php
require_once 'settings.php';
require_once 'helper-functions.php';

function get_revs($db)
{
	$revs = array();
	
	$result = $db->query("SELECT rev, date FROM SvnRevisions ORDER BY rev DESC LIMIT 30");
	while($rev = $result->fetch_assoc())
	{
		$revs[] = array(
					'r' => $rev['rev'],
					'date' => time_elapsed_string($rev['date'])
				);
	}
	
	return $revs;
}

// get results stats
$mysqli = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);
$sql = "SELECT browser, browserMajorVer, svnRev, SUM(rasterDiffMeanSquareError) AS sum, COUNT(rasterDiffMeanSquareError) AS count FROM TestResults 
GROUP BY browser, browserMajorVer, svnRev
ORDER BY CASE WHEN COUNT(rasterDiffMeanSquareError) = 300 THEN 1 ELSE 2 END, svnRev DESC, browser, browserMajorVer DESC";

$result = $mysqli->query($sql);
checkForNewRevisions($mysqli);
$revs = get_revs($mysqli);
?>
<html>
<head>
	<title>svg-edit round-trip test launcher</title>
	<style>
	table {
		border: 1px solid black;
		border-collapse: collapse;
		margin: 1em 0;
	}
	td, th {
		padding: 0 0.5em;
	}
	</style>
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
		echo ("\t\t\t<option value=\"$r\">$r - $date</option>\n");
	}
?>
		</select>
		<input type="submit" value="Go!" />
	</form>
	<h2>Results:</h2>
	<p>
		<strong>Raster Error Score summary</strong>
		<table>
			<tr><th rowspan="2">Revision</th><th colspan="2">Browser</th><th rowspan="2">Error Score</th></tr>
			<tr><th>Name</th><th>Version</th></tr>
<?php 
	while($resultArray = $result->fetch_assoc())
	{
		echo ("\t\t\t<tr>" .
		      "<td><a href='https://code.google.com/p/svg-edit/source/detail?r=" . $resultArray["svnRev"] . "'>" . $resultArray["svnRev"] . "</a></td>" .
		      "<td>" . $resultArray["browser"] . "</td>" .
		      "<td>" . $resultArray["browserMajorVer"] . "</td>" .
		      "<td>");
		if($resultArray["count"] == 300){
			echo $resultArray["sum"];
		} else {
			echo "(tests incomplete)";
		}
		echo "</td></tr>\n";
	}
?>
		</table>
	</p>
	<p>
		<strong>Detail views</strong>
		<ul>
			<li><a target="_blank" href="rasterview.php">Raster image comparisons</a></li>
			<li><a target="_blank" href="diffview.php">Canonical XML side-by-side diffs</a></li>
		</ul>
	</p>
</body>
</html>
