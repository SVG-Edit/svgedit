
module.exports = {
  statements: 45,
  branches: 34,
  lines: 46,
  functions: 45,
  // "excludeNodeModules": false,
  extension: ['.js', '.html', '.json', '.css', '.svg', '.png', '.gif'],
  exclude: [
    'editor/jquery.min.js',
    'editor/jgraduate/**',
    'editor/react-extensions/react-test'
  ],
  reporter: [
    'json-summary',
    'text',
    'html'
  ]
}
