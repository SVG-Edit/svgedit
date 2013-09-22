(function() {

var svgEditEmbed,
	svgEditFrame,
	testResults,
	browserName,
	browserVer,
	browserMajorVer;

function log(data) {
	console.log(data);
	var li = document.createElement('li'),
		text = document.createTextNode(data);
	li.appendChild(text);
	testResults.insertBefore(li, testResults.children.length ? testResults.children[0] : null);
}

function init() {
	log('initializing...');
	
	if(browser.is_firefox()){
		browserName = "FF";
	} else if(browser.is_chrome()){
		browserName = "Chrome";
	} else if(browser.is_safari()){
		browserName = "Safari";
	} else if(browser.is_opera()){
		browserName = "Opera";
	} else if(browser.is_ie()){
		browserName = "IE";
	}
	
	browserMajorVer = browser.version();
	browserVer = browser.full_version();
	
	svgEditEmbed = new embedded_svg_edit(svgEditFrame);
	testIndex = 0;
	runTest();
}

function runTest() {
	var imageTitle,
		url,
		svgId,
		origSource,
		savedSource,
		testli;

	function getNextSvg() {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function()
		{
			if(xhr.readyState == 4){
				if(xhr.status == 200){
					var response = JSON.parse(xhr.responseText);
					if(response.svgId == -1){
						testsComplete();
					} else {
						log("Loaded test " + response.svgId + "...");
						svgId = response.svgId;
						origSource = response.svg;
						openSvg();
					}
				} else {
					log("Failed to load test " + response.svgId + "...");
				}
			}
		}
		
		xhr.open("GET", top.location.href + "&testfetch=1&browser=" + escape(browserName) + "&browserVer=" + escape(browserVer) + "&browserMajorVer=" + browserMajorVer);
		xhr.send();
	}

	function openSvg() {
		// Open the SVG in the editor...
		log('opening in editor...');
		svgEditEmbed.setSvgString(origSource)(function() {
			saveSvg();
		});
	}

	function saveSvg() {
		// Save the XML output from the editor...
		log('saving from editor...');
		svgEditEmbed.getSvgString()(function(xml) {
			savedSource = xml;
			
			var xhr = new XMLHttpRequest();
			xhr.onreadystatechange = function()
			{
				if(xhr.readyState == 4){
					if(xhr.status == 200){
						getNextSvg();
					} else {
						log("Failed to save test.");
					}
				}
			}
			xhr.open("POST", top.location.href + "&teststore=1");			

			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			log('uploading saved source...');
			xhr.send("svgId=" + svgId + "&browser=" + escape(browserName) + "&browserVer=" + escape(browserVer) + "&browserMajorVer=" + browserMajorVer + "&svg=" + escape(savedSource));
		});
	}

	function renderSvg() {
		log('rendering output...');
		var dataPrefix = 'data:image/svg+xml;charset=utf-8,';
		origImage = new Image();
		origImage.width = 320;
		origImage.height = 320;
		origImage.src = dataPrefix + encodeURIComponent(origSource);
		savedImage = new Image();
		savedImage.width = 320;
		savedImage.height = 320;
		savedImage.src = dataPrefix + encodeURIComponent(savedSource);

		testli = document.createElement('li');
		testResults.appendChild(testli);

		imagesLoaded = 0;
		origImage.addEventListener('load', checkAndCompareImages);
		savedImage.addEventListener('load', checkAndCompareImages);
	}
	
	function checkAndCompareImages() {
		imagesLoaded++;
		if (imagesLoaded >= 2) {
			compareImages();
		}
	}

	function compareImages() {
		log('comparing output...');
		try {
			var canvasA = flatten(origImage);
			testli.appendChild(canvasA);
		} catch (e) {
			log("Can't render original image");
		}

		try {
			var canvasB = flatten(savedImage);
			testli.appendChild(canvasB);
		} catch (e) {
			log("Can't render saved image");
		}

		if (canvasA && canvasB) {
			var data = diffCanvases(canvasA, canvasB);
			log('difference score: ' + data.diff);
			testli.appendChild(data.canvas);
		}
		nextTest();
	}
	
	function nextTest() {
		testIndex++;
		runTest();
	}
	
	getNextSvg();
}

/**
 * @param HTMLImageElement image
 * @return HTMLCanvasElement
 */
function flatten(image) {
	var canvas = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;

	var ctx = canvas.getContext('2d');
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
	return canvas;
}

/**
 * @param HTMLCanvasElement canvasA
 * @param HTMLCanvasElement canvasB
 * @return {diff: number, canvas: HTMLCanvasElement}
 */
function diffCanvases(canvasA, canvasB) {
	var width = canvasA.width,
		height = canvasA.height,
		diff = 0;

	var canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;

	var ctx = canvas.getContext('2d'),
		ctxA = canvasA.getContext('2d'),
		ctxB = canvasB.getContext('2d');
	
	var imageData = ctx.createImageData(width, height);
	try {
		var imageDataA = ctxA.getImageData(0, 0, width, height);
	} catch (e) {
		log("Can't getImageData from A: " + e.toString());
	}
	try {
		var imageDataB = ctxB.getImageData(0, 0, width, height);
	} catch (e) {
		log("Can't getImageData from B: " + e.toString());
	}

	if (imageData && imageDataA && imageDataB) {
		var data = imageData.data,
			dataA = imageDataA.data,
			dataB = imageDataB.data,
			i = 0,
			delta = 0,
			abs = Math.abs;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				delta = abs(dataA[i] - dataB[i]);
				diff += delta;
				data[i] = delta;
				i++;
				delta = abs(dataA[i] - dataB[i]);
				diff += delta;
				data[i] = delta;
				i++;
				delta = abs(dataA[i] - dataB[i]);
				diff += delta;
				data[i] = delta;
				i++;
				data[i] = 255; // opaque
				i++;
			}
		}
	}
	
	ctx.putImageData(imageData, 0, 0);

	return {
		diff: diff,
		canvas: canvas
	};
}

/**
 * Call MediaWiki API on Wikimedia Commons with given parameters.
 * Returns JSON results.
 *
 * @param object params
 * @param function callback
 */
function commonsApi(params, callback) {
	var url = 'https://commons.wikimedia.org/w/api.php?format=json';
	for (var i in params) {
		url = url + '&' + i + '=' + encodeURIComponent(params[i]);
	}
	callJsonP(url, callback);
}

/**
 * JSONP call wrapper, as Commons API isn't CORS-ed out yet
 */
function callJsonP(url, callback) {
	var script = document.createElement('script'),
		tempName = 'jsonp_' + ('' + Math.random()).replace('0.', '');

	window[tempName] = function(data) {
		window[tempName] = undefined;
		script.parentNode.removeChild(script);
		callback(data);
	};

	script.src = url + '&callback=' + tempName;
	document.getElementsByTagName('head')[0].appendChild(script);
}

function testsComplete() {
	log('Finished: all tests have been run with this browser and svg-edit revision.');
	svgEditFrame.parentNode.removeChild(svgEditFrame);
}


testResults = document.getElementById('test-results');
svgEditFrame = document.getElementById('svg-edit-frame');
svgEditFrame.addEventListener('load', function() {
	init();
});

})();
