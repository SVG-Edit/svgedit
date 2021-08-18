/**
 * @file ext-opensave.js
 *
 * @license MIT
 *
 * @copyright 2020 OptimistikSAS
 *
 */

/**
   * @type {module:svgcanvas.EventHandler}
   * @param {external:Window} wind
   * @param {module:svgcanvas.SvgCanvas#event:saved} svg The SVG source
   * @listens module:svgcanvas.SvgCanvas#event:saved
   * @returns {void}
   */
import { fileOpen, fileSave } from 'browser-fs-access';

export default {
  name: 'opensave',
  init ({ encode64 }) {
    const svgEditor = this;
    // check suppport for NativeFileAPI
    const supportsNativeFileApi = !!window.showOpenFilePicker;
    let fileHandle;
    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, { type: contentType });
      return blob;
    };
    svgEditor.setCustomHandlers({
      async save (win, svg) {
        this.showSaveWarning = false;

        // by default, we add the XML prolog back, systems integrating SVG-edit (wikis, CMSs)
        // can just provide their own custom save handler and might not want the XML prolog
        svg = '<?xml version="1.0"?>\n' + svg;

        if (fileHandle) {
          const writableStream = await fileHandle.createWritable();
          writableStream.write(svg);
          writableStream.close();
        } else {
          const b64Data = encode64(svg);
          const blob = b64toBlob(b64Data, 'image/svg+xml');
          try {
            await fileSave(blob, {
              fileName: 'icon.svg',
              extensions: [ '.svg' ]
            });
          } catch (err) {
            if (err.name !== 'AbortError') {
              return console.error(err);
            }
          }
        } /* else {
          // legacy save
          // Since saving SVGs by opening a new window was removed in Chrome use artificial link-click
        // https://stackoverflow.com/questions/45603201/window-is-not-allowed-to-navigate-top-frame-navigations-to-data-urls
          const a = document.createElement('a');
          a.href = 'data:image/svg+xml;base64,' + encode64(svg);
          a.download = 'icon.svg';
          a.style.display = 'none';
          document.body.append(a); // Need to append for Firefox

          a.click();

          // Alert will only appear the first time saved OR the
          //   first time the bug is encountered
          const done = this.configObj.pref('save_notice_done');

          if (done !== 'all') {
            const note = svgEditor.i18next.t('notification.saveFromBrowser', { type: 'SVG' });

            this.configObj.pref('save_notice_done', 'all');
            if (done !== 'part') {
              seAlert(note);
            }
          }

        } */
      },
      async open () {
        // ask user before clearing an unsaved SVG
        const response = await this.openPrep();
        if (response === 'Cancel') { return; }
        this.svgCanvas.clear();
        if (supportsNativeFileApi) {
          const options = {
            multiple: false,
            types: [
              {
                accept: {
                  'image/svg+xml': '.svg'
                }
              }
            ],
            excludeAcceptAllOption: true
          };
          [ fileHandle ] = await window.showOpenFilePicker(options);
          const file = await fileHandle.getFile();
          const svgContent = await file.text();
          await this.loadSvgString(svgContent);
          this.updateCanvas();
        } else {
          try {
            const blob = await fileOpen({
              mimeTypes: [ 'image/*' ]
            });
            const svgContent = await blob.text();
            await this.loadSvgString(svgContent);
            this.updateCanvas();
          } catch (err) {
            if (err.name !== 'AbortError') {
              return console.error(err);
            }
          }
        }
        /*else {
          const input = document.createElement('input');
          input.type = 'file';
          input.addEventListener('change', (e) => {
            // getting a hold of the file reference
            const file = e.target.files[0];
            // setting up the reader
            const reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            // here we tell the reader what to do when it's done reading...
            reader.addEventListener('load', async (readerEvent) => {
              const content = readerEvent.target.result;
              await this.loadSvgString(content);
              this.updateCanvas();
            });
          });
          input.click();
        } */
      }
    });
  }
};
