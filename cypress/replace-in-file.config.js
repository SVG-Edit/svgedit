const options = {
  files: 'instrumented/**',
  from: "import SvgCanvas from '@svgedit/svgcanvas';",
  to: "import SvgCanvas from '/instrumented/svgcanvas/svgcanvas.js'"
}

module.exports = options
