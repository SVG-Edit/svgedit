import {supportsSvg} from '../common/browser.js';

if (!supportsSvg()) {
  window.location = 'browser-not-supported.html';
}
