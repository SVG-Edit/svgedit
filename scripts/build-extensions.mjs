import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { build } from 'vite'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import string from 'vite-plugin-string'

const root = process.cwd()
const extensionsRoot = resolve(root, 'src/editor/extensions')
const outDir = resolve(root, 'dist/editor')

const htmlStringPlugin = string({
  include: [
    'src/editor/dialogs/**/*.html',
    'src/editor/panels/*.html',
    'src/editor/templates/*.html',
    'src/editor/extensions/*/*.html'
  ]
})
htmlStringPlugin.enforce = 'post'

const entries = []
for (const dirent of await readdir(extensionsRoot, { withFileTypes: true })) {
  if (!dirent.isDirectory() || !dirent.name.startsWith('ext-')) continue
  const entryPath = join(extensionsRoot, dirent.name, `${dirent.name}.js`)
  try {
    const st = await stat(entryPath)
    if (st.isFile()) entries.push(entryPath)
  } catch (_err) {
    // no entry file, skip
  }
}

if (!entries.length) {
  console.info('No extension entries found')
  process.exit(0)
}

await build({
  // Use isolated config to avoid inheriting the main lib/iife build.
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
    outDir,
    emptyOutDir: false, // main build already wrote Editor.js, keep it
    sourcemap: true,
    minify: false, // keep exports intact
    rollupOptions: {
      treeshake: false,
      preserveEntrySignatures: 'strict',
      input: entries,
      output: {
        format: 'es',
        inlineDynamicImports: false,
        preserveModules: true,
        preserveModulesRoot: extensionsRoot,
        entryFileNames: '[name].js',
        chunkFileNames: 'extensions/_chunks/[name]-[hash].js',
        assetFileNames: 'extensions/_assets/[name]-[hash][extname]'
      }
    }
  }
})

console.info(`Bundled ${entries.length} extensions`)
