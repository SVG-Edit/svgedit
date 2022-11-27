const options = {
  files: 'instrumented/**',
  from: "import SvgCanvas from '@svgedit/svgcanvas';",
  to: "import SvgCanvas from '@svgedit/svgcanvas/instrumented/svgcanvas.js';"
}

module.exports = options
