import {supportsSvg} from './browser.js';
if (!supportsSvg()) {
  window.location = 'browser-not-supported.html';
}
