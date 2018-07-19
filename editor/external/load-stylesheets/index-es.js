function loadStylesheets(stylesheets, {
    before: beforeDefault, after: afterDefault, favicon: faviconDefault,
    canvas: canvasDefault, image: imageDefault = true,
    acceptErrors
} = {}) {
    stylesheets = Array.isArray(stylesheets) ? stylesheets : [stylesheets];

    function setupLink(stylesheetURL) {
        let options = {};
        if (Array.isArray(stylesheetURL)) {
            [stylesheetURL, options = {}] = stylesheetURL;
        }
        let { favicon = faviconDefault } = options;
        const {
            before = beforeDefault,
            after = afterDefault,
            canvas = canvasDefault,
            image = imageDefault
        } = options;
        function addLink() {
            if (before) {
                before.before(link);
            } else if (after) {
                after.after(link);
            } else {
                document.head.appendChild(link);
            }
        }

        const link = document.createElement('link');
        return new Promise((resolve, reject) => {
            let rej = reject;
            if (acceptErrors) {
                rej = typeof acceptErrors === 'function' ? error => {
                    acceptErrors({ error, stylesheetURL, options, resolve, reject });
                } : resolve;
            }
            if (stylesheetURL.endsWith('.css')) {
                favicon = false;
            } else if (stylesheetURL.endsWith('.ico')) {
                favicon = true;
            }
            if (favicon) {
                link.rel = 'shortcut icon';
                link.type = 'image/x-icon';

                if (image === false) {
                    link.href = stylesheetURL;
                    addLink();
                    resolve(link);
                    return;
                }

                const cnv = document.createElement('canvas');
                cnv.width = 16;
                cnv.height = 16;
                const context = cnv.getContext('2d');
                const img = document.createElement('img');
                img.addEventListener('error', error => {
                    reject(error);
                });
                img.addEventListener('load', () => {
                    context.drawImage(img, 0, 0);
                    link.href = canvas ? cnv.toDataURL('image/x-icon') : stylesheetURL;
                    addLink();
                    resolve(link);
                });
                img.src = stylesheetURL;
                return;
            }
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = stylesheetURL;
            addLink();
            link.addEventListener('error', error => {
                rej(error);
            });
            link.addEventListener('load', () => {
                resolve(link);
            });
        });
    }

    return Promise.all(stylesheets.map(setupLink));
}

export default loadStylesheets;
