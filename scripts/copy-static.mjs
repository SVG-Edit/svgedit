import { cp, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const outDir = resolve(root, 'dist/editor')

await mkdir(outDir, { recursive: true })

const targets = [
  ['src/editor/index.html', 'index.html'],
  ['src/editor/xdomain-index.html', 'xdomain-index.html'],
  ['src/editor/iife-index.html', 'iife-index.html'],
  ['src/editor/browser-not-supported.html', 'browser-not-supported.html'],
  ['src/editor/browser-not-supported.js', 'browser-not-supported.js'],
  ['src/editor/svgedit.css', 'svgedit.css'],
  ['src/editor/images', 'images'],
  ['src/editor/components/jgraduate/images', 'components/jgraduate/images'],
  ['src/editor/extensions', 'extensions'],
  // Test harness assets for Playwright (unit-style tests in browser)
  ['src/editor/tests', 'tests'],
  ['packages/svgcanvas', 'tests/vendor/svgcanvas'],
  ['node_modules/pathseg/pathseg.js', 'tests/vendor/pathseg/pathseg.js']
]

for (const [src, dest] of targets) {
  await cp(resolve(root, src), resolve(outDir, dest), { recursive: true })
}

console.info('Copied static editor assets to dist/editor')
