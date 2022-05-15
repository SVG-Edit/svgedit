import { fromRollup } from '@web/dev-server-rollup'
import rollupCommonjs from '@rollup/plugin-commonjs'
import rollupHtml from 'rollup-plugin-html'

const commonjs = fromRollup(rollupCommonjs)
const html = fromRollup(rollupHtml)

export default {
  mimeTypes: {
    // serve imported html files as js
    'src/editor/panels/*.html': 'js',
    'src/editor/templates/*.html': 'js',
    'src/editor/dialogs/*.html': 'js',
    'src/editor/extensions/*/*.html': 'js',
    'instrumented/editor/panels/*.html': 'js',
    'instrumented/editor/templates/*.html': 'js',
    'instrumented/editor/dialogs/*.html': 'js',
    'instrumented/editor/extensions/*/*.html': 'js'
  },
  plugins: [
    html({
      include: [
        'src/editor/panels/*.html',
        'src/editor/templates/*.html',
        'src/editor/dialogs/*.html',
        'src/editor/extensions/*/*.html',
        'instrumented/editor/panels/*.html',
        'instrumented/editor/templates/*.html',
        'instrumented/editor/dialogs/*.html',
        'instrumented/editor/extensions/*/*.html'
      ]
    }),
    commonjs({
      // explicitely list packages to increase performance
      include: [
        '**/node_modules/rgbcolor/**/*',
        '**/node_modules/raf/**/*',
        '**/node_modules/font-family-papandreou/**/*',
        '**/node_modules/svgpath/**/*',
        '**/node_modules/cssesc/**/*',
        '**/node_modules/core-js/**/*',
        '**/node_modules/performance-now/**/*'
      ]
    })
  ]
}
