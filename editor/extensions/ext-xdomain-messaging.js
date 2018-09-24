/**
* Should not be needed for same domain control (just call via child frame),
*  but an API common for cross-domain and same domain use can be found
*  in embedapi.js with a demo at embedapi.html
*/
export default {
  name: 'xdomain-messaging',
  init () {
    const svgEditor = this;
    const svgCanvas = svgEditor.canvas;
    try {
      window.addEventListener('message', function (e) {
        // We accept and post strings for the sake of IE9 support
        if (!e.data || !['string', 'object'].includes(typeof e.data) || e.data.charAt() === '|') {
          return;
        }
        const data = typeof e.data === 'object' ? e.data : JSON.parse(e.data);
        if (!data || typeof data !== 'object' || data.namespace !== 'svgCanvas') {
          return;
        }
        // The default is not to allow any origins, including even the same domain or
        //  if run on a `file:///` URL. See `svgedit-config-es.js` for an example of how
        //  to configure
        const {allowedOrigins} = svgEditor.curConfig;
        if (!allowedOrigins.includes('*') && !allowedOrigins.includes(e.origin)) {
          console.log(`Origin ${e.origin} not whitelisted for posting to ${window.origin}`);
          return;
        }
        const cbid = data.id;
        const {name, args} = data;
        const message = {
          namespace: 'svg-edit',
          id: cbid
        };
        try {
          // Now that we know the origin is trusted, we perform otherwise
          //   unsafe arbitrary canvas method execution
          message.result = svgCanvas[name](...args); // lgtm [js/remote-property-injection]
        } catch (err) {
          message.error = err.message;
        }
        e.source.postMessage(JSON.stringify(message), '*');
      }, false);
    } catch (err) {
      console.log('Error with xdomain message listener: ' + err);
    }
  }
};
