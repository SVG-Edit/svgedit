const supportsSvg = function () {
  return Boolean(document.createElementNS && document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect)
}

if (!supportsSvg()) {
  window.location = './browser-not-supported.html'
}
export {}
