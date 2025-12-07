import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { createInstrumenter } from 'istanbul-lib-instrument'
import { dirname, resolve } from 'node:path'

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
  ['node_modules/pathseg/pathseg.js', 'tests/vendor/pathseg/pathseg.js']
]

for (const [src, dest] of targets) {
  await cp(resolve(root, src), resolve(outDir, dest), { recursive: true })
}

// Instrument svgcanvas sources when collecting coverage so Playwright runs hit instrumented code.
const svgCanvasSrc = resolve(root, 'packages/svgcanvas')
const svgCanvasDest = resolve(outDir, 'tests/vendor/svgcanvas')
await cp(svgCanvasSrc, svgCanvasDest, { recursive: true })
if (process.env.COVERAGE === 'true') {
  const instrumenter = createInstrumenter({ compact: false })
  const instrumentPaths = [
    'common/util.js',
    'core/touch.js',
    'core/namespaces.js',
    'core/utilities.js',
    'core/math.js',
    'core/path.js',
    'core/coords.js',
    'core/units.js',
    'core/draw.js',
    'core/history.js',
    'core/recalculate.js',
    'core/clear.js'
  ]
  for (const relativePath of instrumentPaths) {
    const sourceFile = resolve(svgCanvasSrc, relativePath)
    const destFile = resolve(svgCanvasDest, relativePath)
    const code = await readFile(sourceFile, 'utf8')
    const instrumented = instrumenter.instrumentSync(code, sourceFile)
    await mkdir(dirname(destFile), { recursive: true })
    await writeFile(destFile, instrumented, 'utf8')
  }
}

console.info('Copied static editor assets to dist/editor')
