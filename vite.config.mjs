import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import string from 'vite-plugin-string'
import istanbul from 'vite-plugin-istanbul'

const editorEntries = [
  resolve(__dirname, 'src/editor/index.html'),
  resolve(__dirname, 'src/editor/iife-index.html'),
  resolve(__dirname, 'src/editor/xdomain-index.html')
]

const coverageEnabled = process.env.COVERAGE === 'true' || process.env.NODE_ENV === 'test'
const htmlStringPlugin = string({
  include: [
    'src/editor/dialogs/**/*.html',
    'src/editor/panels/*.html',
    'src/editor/templates/*.html',
    'src/editor/extensions/*/*.html'
  ]
})
htmlStringPlugin.enforce = 'post'

export default defineConfig({
  root: '.',
  appType: 'mpa',
  base: './',
  server: {
    host: '0.0.0.0',
    port: 8000,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 8000,
    strictPort: true
  },
  plugins: [
    {
      name: 'svgedit-skip-vite-build-html',
      apply: 'build',
      enforce: 'pre',
      configResolved (config) {
        config.plugins = config.plugins.filter(plugin => plugin.name !== 'vite:build-html')
      }
    },
    htmlStringPlugin,
    {
      ...dynamicImportVars({
        include: ['src/editor/locale.js', 'src/editor/extensions/*/*.js']
      }),
      apply: 'build'
    },
    coverageEnabled &&
      istanbul({
        include: ['src/editor/**', 'packages/svgcanvas/**'],
        exclude: ['node_modules', 'dist', 'packages/**/dist'],
        extension: ['.js'],
        forceBuildInstrument: true
      }),
    {
      name: 'svgedit-html-asset-string',
      enforce: 'pre',
      generateBundle (_options, bundle) {
        for (const asset of Object.values(bundle)) {
          if (asset.type === 'asset' && asset.fileName.endsWith('.html') && typeof asset.source !== 'string') {
            asset.source = asset.source.toString()
          }
        }
      }
    }
  ].filter(Boolean),
  optimizeDeps: {
    // Restrict dependency scanning to the main editor entry points; archive assets stay untouched.
    entries: editorEntries
  },
  build: {
    outDir: 'dist/editor',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/editor/Editor.js'),
      name: 'Editor',
      formats: ['es', 'iife'],
      fileName: format => (format === 'iife' ? 'iife-Editor.js' : 'Editor.js')
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/unit/setup-vitest.js'],
    include: ['tests/**/*.test.{js,ts}'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      include: [
        'src/editor/locale.js',
        'src/editor/MainMenu.js',
        'src/editor/contextmenu.js',
        'packages/svgcanvas/core/paint.js',
        'packages/svgcanvas/core/dataStorage.js',
        'packages/svgcanvas/core/clear.js',
        'packages/svgcanvas/core/path.js',
        'packages/svgcanvas/core/coords.js',
        'packages/svgcanvas/core/recalculate.js',
        'packages/svgcanvas/core/utilities.js',
        'packages/svgcanvas/core/layer.js',
        'packages/svgcanvas/core/sanitize.js',
        'packages/svgcanvas/common/util.js',
        'packages/svgcanvas/core/touch.js'
      ]
    }
  }
})
