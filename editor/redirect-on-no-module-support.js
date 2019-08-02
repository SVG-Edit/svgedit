// This file should only load if the user's browser doesn't support ESM
// This file will be stripped from the non-modular versions

// We only need to replace the first instance
location.href = location.href
  .replace(/(?:xdomain-)?svg-editor-es\.html/, 'svg-editor.html')
  .replace('openclipart-es.html', 'openclipart.html')
  .replace('imagelib/index-es.html', 'imagelib/index.html');
