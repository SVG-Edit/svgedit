<?php
require_once 'settings.php';

require_once('helper-functions.php');

$db = new mysqli($dbhost, $dbuser, $dbpass, $dbschema);
if($db->connect_errno)
{
	echo ("Couldn't connect to database: " . $db->connect_error);
	die();
}
$db->set_charset("utf8");

$imagickFail = 0;
$compareFail = 0;
$count = 0;
$currResultId = 0;

do
{
	$qr = $db->query("SELECT R.resultId, R.svgId, R.svg, T.png FROM TestResults R INNER JOIN Tests T ON R.svgId = T.svgId WHERE resultId > $currResultId ORDER BY resultId LIMIT 1");
	$continue = false;
	if($qr->num_rows)
	{
		$continue = true;
		$count++;
		$qr = $qr->fetch_assoc();
		$currResultId = $qr['resultId'];
		
		print "Processing result $currResultId for test ${qr['svgId']}\n";
		
		// 1. rerender the svg
		$png = SvgToPng($qr['svg']);
		
		if($png)
		{
			// 2. rerun pixel-by-pixel diff			
			try
			{
				try
				{
					$IM_orig = new Imagick();
					$IM_orig->readimageblob($qr['png']);
				} catch(ImagickException $e)
				{	
					print ("IMagick failed to read test png... " . strlen($png) . " ");
					$IM_orig = new Imagick();
					$IM_orig->readimageblob(gdPngToPng($qr['png']));
				}
				
				try
				{
					$IM_test = new IMagick();
					$IM_test->readimageblob($png);
				} catch(ImagickException $e)
				{
					print ("IMagick failed to read result png... " . strlen($png) . " ");
					file_put_contents('/tmp/fail.png', $png);
					$IM_test = new IMagick();
					$IM_test->readimageblob(gdPngToPng($png));
				}
			} catch(ImagickException $e)
			{
				print "*** IMagick unable to deal with png, result $currResultId for test ${qr['svgId']}: $e";
				$imagickFail++;
				continue;
			}

			if($IM_orig->getImageWidth() != $IM_test->getImageWidth() || $IM_orig->getImageHeight() != $IM_test->getImageHeight())
			{
				print ("*** Dimension mismatch result $currResultId, original: " . $IM_orig->getImageWidth() . "x" .  $IM_orig->getImageHeight() . ", result: "  . $IM_test->getImageWidth() . "x" . $IM_test->getImageHeight() . "\n"); 
			}
			try
			{			
				$img_diff = $IM_orig->compareImages($IM_test, Imagick::METRIC_MEANSQUAREERROR);
			} catch(ImagickException $e)
			{
				print "*** Compare failed, result $currResultId for test ${qr['svgId']}: $e\n";
				$compareFail++;				
				$img_diff = array(0 => file_get_contents('comparefail.png'), 1=>1);
			}
		} else {
			print ("*** unable to render png for resultId $currResultId\n");
			$png = "";
			$img_diff = array(0=>"",1=>1);
		}
				
		$updateStmt = $db->prepare("UPDATE TestResults SET png = ?, pngdiff = ?, rasterDiffMeanSquareError = ? WHERE resultId = ?");
		$null = NULL;
		$updateStmt->bind_param("bbdi", $null, $null, $img_diff[1], $currResultId);
		send_long_data_helper($updateStmt, 0, $png);
		send_long_data_helper($updateStmt, 1, $img_diff[0]);
		$updateStmt->execute();
		
		if($db->errno)
		{
			print ("UPDATE failed. Errno " . $db->errno . ": " . $db->error . "\n");
		}
		$updateStmt->close();
	}
} while($continue);

print "\nDone. There were $imagickFail png load failures and $compareFail comparison failures in $count test results.\n";
