<?php
function getRandomSvg($iters)
{
	if($iters > 25) return false;
	
	$randomIndex = new DOMDocument();
	$randomIndex->load("http://commons.wikimedia.org/w/api.php?action=query&list=random&rnnamespace=6&rnlimit=10&format=xml");
	
	$svgElemSearcher = new DOMXPath($randomIndex);
	$svgElems = $svgElemSearcher->query("/api/query/random/page[translate(substring(@title, string-length(@title) - 3), 'SVG', 'svg') = '.svg']");
	
	if($svgElems->length > 0)
	{
		$result = array("id" => $svgElems->item(0)->attributes->getNamedItem("id")->nodeValue,
						"title" => $svgElems->item(0)->attributes->getNamedItem("title")->nodeValue
				);
		return $result;
	} else {
		// no svg in this random index of files
		return getRandomSvg($iters++);
	}
}


function getSvgUrl()
{
	$svg = getRandomSvg(1);
	if(!$svg)
	{
		applog("Unable to find an svg.");
		return false;
	}
	$svgid = $svg["id"];
	$svgtitle = $svg["title"];
	
	//http://commons.wikimedia.org/w/api.php?action=query&pageids=15046375&prop=imageinfo&iiprop=url&format=xml
	$resturl =  "http://commons.wikimedia.org/w/api.php?action=query&pageids=$svgid&prop=imageinfo&iiprop=url&format=xml";
	//$resturl = "http://commons.wikimedia.org/w/api.php?action=query&titles=$svgtitle&prop=imageinfo&iiprop=url&format=xml";
	$imageInfoDoc = new DOMDocument();
	$imageInfoDoc->load($resturl);
	
	$urlSearcher = new DOMXPath($imageInfoDoc);
	$urlNode = $urlSearcher->query("//ii/@url");
	if($urlNode->length > 0)
	{
		return array("url" => $urlNode->item(0)->nodeValue, "title" => $svg["title"]);
	} else {
		applog("Unable to find the svg's URL");
		return false;
	}
}

function testSvgStrictValidity($svg)
{
	$validator = "http://home.mbaynton.com/w3c-validator/check";
	// is it valid?
	$validator_fields = array("fragment" => $svg, "charset" => "(detect automatically)");

	// does the svg document specify a version?
	$svgDoc = new DOMDocument();
	@$svgDoc->loadXML($svg);
	$versionSearch = new DOMXPath($svgDoc);
	$versionSearch->registerNamespace("svg", "http://www.w3.org/2000/svg");
	$verAttr = $versionSearch->query("/svg:svg/@version");
	if($verAttr->length == 1)
	{
		$svg_version = $verAttr->item(0)->nodeValue;
	} else {
		$svg_version = "1.1";
	}


	// does the svg specify a doctype?
	if(strpos("<!DOCTYPE", $svg) === false)
	{
		$validator_fields["doctype"] = "SVG $svg_version";
	}

	// call to validator
	$validator_output = POST($validator, $validator_fields);
	$validatordoc = new DOMDocument();
	@$validatordoc->loadHTML($validator_output);
	$validationSearcher = new DOMXPath($validatordoc);
	$isValid = $validationSearcher->query("//td[@class = 'valid']"); // catches both passed and tenatatively passed results, unlike //h2[@class = 'valid']
	if($isValid->length > 0)
	{
		$isValid = 1;
	} else
	{
		$isValid = 0;
	}

	return $isValid;
}

function fetchRandomSvg()
{
	$svgInfo = getSvgUrl();
	if($svgInfo)
	{
		$url = $svgInfo["url"];
	
		return array("svg" => file_get_contents($url), "title" => $svgInfo["title"]);
	} else {
		return false;
	}
}

function POST($url, $data)
{
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	$result = curl_exec($ch);
	
	curl_close($ch);
	
	return $result;
}

function XmlCanonicalize($xml)
{
	$doc = new DOMDocument();
	@$doc->loadXML($xml);
	$doc = @$doc->C14N(false,true);
	if($doc !== null)
	{
		return $doc;
	} else {
		return "";
	}
}

// returns png bytestream
function SvgToPng($svg)
{
	static $rsvgConvert;
	if(!$rsvgConvert)
	{
		require('settings.php');
	}
	
	$process = proc_open(
			$rsvgConvert,
			array(
					0 => array("pipe", "r"), // child's stdin
					1 => array("pipe", "w"), // child's stdout
					2 => array("pipe", "w") // child's stderr
				),
			$pipes,
			'/tmp'
			);
	
	if(is_resource($process))
	{
		fwrite($pipes[0], $svg);
		fclose($pipes[0]);
		
		$png = stream_get_contents($pipes[1]);
		fclose($pipes[1]);
		
		// log rsvg error chatter
		//file_put_contents('/tmp/svg-errors.log', stream_get_contents($pipes[2]) . "\n", FILE_APPEND);
		
		if(substr($png, 0, 5) == "Error")
		{
			$png = "";
			applog("PNG render failed: $png ** " . stream_get_contents($pipes[2]));
		}
		
		fclose($pipes[2]);
		proc_close($process);		
		
		return $png;
	} else {
		return "";
	}
	
	/*
	 * The inkscape way doesn't render as much as rsvg,
	 * plus all the temp files kinda suck
	$tmpPng = tempnam(sys_get_temp_dir(), "svgtest-");
	$tmpSvg = tempnam(sys_get_temp_dir(), "svgtest-");
	file_put_contents($tmpSvg, $svg);
	`$inkscape --export-png="$tmpPng" "$tmpSvg"`;
	
	$png = file_get_contents($tmpPng);
	
	unlink($tmpPng);
	unlink($tmpSvg);
	
	return $png;
	*/
	
	/*
	 * the Imagick way may doesn't seem as reliable and is definitely slower
	$im = new Imagick();
	$im->setFormat("svg");
	$im->readimageblob($svg);
	$im->setimageformat("png");
	return $im->getimageblob();
	*/
}

/*
untested...
function removeBOM($str)
{
	$boms = array(
		pack("CCC", 0xef, 0xbb, 0xbf), // UTF-8
		pack("CC", 0xfe, 0xff), // UTF-16 (big-endian)
		pack("CC", 0xfe, 0xfe), // UTF-16 (little-endian)
		pack("CCCC", 0x00, 0x00, 0xfe, 0xff), // UTF-32 (big-endian)
		pack("CCCC", 0xff, 0xfe, 0x00, 0x00) // UTF-32 (little-endian)
	);
	
	foreach($boms as $bom)
	{
		if(substr($str, 0, strlen($bom)) == $bom)
		{
			return substr($str, strlen($bom));
		}
	}
	return $str;
}
*/

// assumes 8mb per packet
function send_long_data_helper($stmt, $pos, $data)
{
	$datalen = strlen($data);
	$txlength = 8388608;
	$strix = 0;
	while($strix < $datalen)
	{
		$part = substr($data, $strix, $txlength);
		$stmt->send_long_data($pos, $part);
		$strix += $txlength;
	}
}

function applog($str)
{
	error_log("svg-edit roundtrip tester: $str");
}

// Regenerates a png using the GD image library.
function gdPngToPng($png)
{
	$gd = imagecreatefromstring($png);
	ob_start();
	imagepng($gd);
	return ob_get_flush();
}

/* $db is a connected mysqli instance */
function checkForNewRevisions($db)
{
	$lastKnownRev = 2500;
	$result = $db->query("SELECT rev FROM SvnRevisions ORDER BY rev DESC LIMIT 1");
	if($result = $result->fetch_assoc())
	{
		$lastKnownRev = $result['rev'];
	}
	
	$newRevs = @svn_log('https://svg-edit.googlecode.com/svn/trunk', $lastKnownRev+1, SVN_REVISION_HEAD);
	if($newRevs)
	{
		$insStmt = $db->prepare("INSERT INTO SvnRevisions(rev, date) VALUES(?, ?)");
		foreach($newRevs AS $rev)
		{
			$insStmt->bind_param("is", $rev['rev'], $rev['date']);
			$insStmt->execute();
		}
		$insStmt->close();
	}
}

function time_elapsed_string($datetime, $full = false) {
	$utc = new DateTimeZone("UTC");
	$now = new DateTime("now", $utc);
	$ago = new DateTime($datetime, $utc);
	
	$diff = $now->diff($ago);

	$diff->w = floor($diff->d / 7);
	$diff->d -= $diff->w * 7;

	$string = array(
			'y' => 'year',
			'm' => 'month',
			'w' => 'week',
			'd' => 'day',
			'h' => 'hour',
			'i' => 'minute',
			's' => 'second',
	);
	foreach ($string as $k => &$v) {
		if ($diff->$k) {
			$v = $diff->$k . ' ' . $v . ($diff->$k > 1 ? 's' : '');
		} else {
			unset($string[$k]);
		}
	}

	if (!$full) $string = array_slice($string, 0, 1);
	return $string ? implode(', ', $string) . ' ago' : 'just now';
}