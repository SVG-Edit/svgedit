import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { build } from 'vite'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import string from 'vite-plugin-string'

const root = process.cwd()
const extensionsRoot = resolve(root, 'src/editor/extensions')

const htmlStringPlugin = string({
  include: [
    'src/editor/dialogs/**/*.html',
    'src/editor/panels/*.html',
    'src/editor/templates/*.html',
    'src/editor/extensions/*/*.html'
  ]
})
htmlStringPlugin.enforce = 'post'

const extensionDirs = await readdir(extensionsRoot, { withFileTypes: true })
const entries = []

for (const dir of extensionDirs) {
  if (!dir.isDirectory()) continue
  if (!dir.name.startsWith('ext-')) continue
  const entryPath = join(extensionsRoot, dir.name, `${dir.name}.js`)
  try {
    const stats = await stat(entryPath)
    if (stats.isFile()) {
      // Key keeps the extensions/<name>/<file> layout in dist/editor
      entries.push([`extensions/${dir.name}/${dir.name}`, entryPath])
    }
  } catch (_error) {
    // Not an extension entry point; skip
  }
}

if (!entries.length) {
  console.info('No extensions found to bundle')
  process.exit(0)
}

const input = Object.fromEntries(entries)

await build({
  // Avoid inheriting the library build (iife) from vite.config.mjs.
  configFile: false,
  root,
  base: './',
  logLevel: 'info',
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
        include: ['src/editor/extensions/*/*.js']
      }),
      apply: 'build'
    }
  ],
  build: {
    outDir: resolve(root, 'dist/editor'),
    emptyOutDir: false,
    sourcemap: true,
    treeshake: false,
    rollupOptions: {
      input,
      output: {
        format: 'es',
        inlineDynamicImports: false,
        entryFileNames: '[name].js',
        chunkFileNames: 'extensions/_chunks/[name]-[hash].js',
        assetFileNames: 'extensions/_assets/[name]-[hash][extname]'
      }
    }
  }
})

console.info(`Bundled ${entries.length} extensions`)
