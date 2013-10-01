<?php
/*
 * Create your own settings.php file defining the following variables:
 * - $dbhost   - host of mysql server
 * - $dbuser   - mysql user to log in as
 * - $dbpass   - mysql password
 * - $dbschema - database name containing the tests and test result tables  
 * - $baseURL  - URL to the hosted roundtrip-test-src directory on your server. Exclude trailing /.
 */
require_once 'settings.php';

require_once('helper-functions.php');

$db = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);
if($db->connect_errno)
{
	echo ("Couldn't connect to database: " . $db->connect_error);
	die();
}

$currSvgId = 0;

do
{
	$qr = $db->query("SELECT svgId, svg FROM Tests WHERE svgId > $currSvgId ORDER BY svgId LIMIT 1");
	$continue = false;	
	if($qr->num_rows)
	{
		$continue = true;
		$qr = $qr->fetch_assoc();
		$currSvgId = $qr['svgId'];
		$svg = $qr['svg'];
		
		print "Processing $currSvgId\n";
		$png = SvgToPng($svg);
		
		if($png)
		{
			$updateStmt = $db->prepare("UPDATE Tests SET png = ? WHERE svgId = ?");
			$null = NULL;			
			$updateStmt->bind_param("bi", $null, $currSvgId);
			send_long_data_helper($updateStmt, 0, $png);
			$updateStmt->execute();
			
			if($db->errno)
			{
				print("UPDATE failed. Errno " . $db->errno . ": " . $db->error . "\n");
			}
			$updateStmt->close();

		} else {
			print "*** no png rendered for $currSvgId\n";
		}
	}

} while($continue);

