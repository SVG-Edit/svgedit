/**
* Should not be needed for same domain control (just call via child frame),
*  but an API common for cross-domain and same domain use can be found
*  in embedapi.js with a demo at embedapi.html
*/
/*globals svgEditor, svgCanvas*/
svgEditor.addExtension('xdomain-messaging', function() {'use strict';
	try {
		window.addEventListener('message', function(e) {
			// We accept and post strings for the sake of IE9 support
			if (typeof e.data !== 'string' || e.data.charAt() === '|') {
				return;
			}
			var cbid, name, args, message, allowedOrigins, data = JSON.parse(e.data);
			if (!data || typeof data !== 'object' || data.namespace !== 'svgCanvas') {
				return;
			}
			// The default is not to allow any origins, including even the same domain or if run on a file:// URL
			//  See config-sample.js for an example of how to configure
			allowedOrigins = svgEditor.curConfig.allowedOrigins;
			if (allowedOrigins.indexOf('*') === -1 && allowedOrigins.indexOf(e.origin) === -1) {
				return;
			}
			cbid = data.id;
			name = data.name;
			args = data.args;
			message = {
				namespace: 'svg-edit',
				id: cbid
			};
			try {
				message.result = svgCanvas[name].apply(svgCanvas, args);
			} catch (err) {
				message.error = err.message;
			}
			e.source.postMessage(JSON.stringify(message), '*');
		}, false);
	}
	catch (err) {
		console.log('Error with xdomain message listener: ' + err);
	}
});
