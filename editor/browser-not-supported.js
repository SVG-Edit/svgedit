/* eslint-disable no-var */
/* globals $ */
var viewportHeight = window.innerHeight || ($(window).height() - 140);
var iframe = document.createElement('iframe');
iframe.style.width = '100%';
iframe.style.height = viewportHeight + 'px';
iframe.src = 'http://caniuse.com/#cats=SVG';
document.body.appendChild(iframe);
