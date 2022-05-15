/* eslint-env node */
// This rollup script is run by the command:
// 'npm run build'

import path from 'path'
import { lstatSync, readdirSync } from 'fs'
import rimraf from 'rimraf'
import babel from '@rollup/plugin-babel'
import copy from 'rollup-plugin-copy'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import url from '@rollup/plugin-url' // for XML/SVG files
import html from 'rollup-plugin-html'

import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import { terser } from 'rollup-plugin-terser'
// import progress from 'rollup-plugin-progress';
import filesize from 'rollup-plugin-filesize'

// utility function
const getDirectories = (source) => {
  const isDirectory = (dir) => {
    return lstatSync(dir).isDirectory()
  }
  return readdirSync(source).map((name) => path.join(source, name)).filter((i) => isDirectory(i))
}

// capture the list of files to build for extensions and ext-locales
const extensionDirs = getDirectories('src/editor/extensions')

const dest = ['dist/editor']

// remove existing distribution
rimraf('./dist', () => console.info('recreating dist'))

// config for svgedit core module
const config = [{
  input: ['src/editor/Editor.js'],
  output: [
    {
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: true,
      file: 'dist/editor/Editor.js'
    },
    {
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: true,
      file: 'dist/editor/xdomain-Editor.js',
      intro: 'const XDOMAIN = true;'
    },
    {
      file: 'dist/editor/iife-Editor.js',
      format: 'iife',
      inlineDynamicImports: true,
      name: 'Editor',
      sourcemap: true
    }
  ],
  plugins: [
    copy({
      targets: [
        {
          src: 'src/editor/index.html',
          dest: 'dist/editor'
        },
        {
          src: 'src/editor/index.html',
          dest: 'dist/editor',
          rename: 'xdomain-index.html',
          transform: (contents) => contents.toString()
            .replace("import Editor from './Editor.js'", "import Editor from './xdomain-Editor.js")
        },
        {
          src: 'src/editor/index.html',
          dest: 'dist/editor',
          rename: 'iife-index.html',
          transform: (contents) => {
            const replace1 = contents.toString().replace("import Editor from './Editor.js'", "/* import Editor from './xdomain-Editor.js' */")
            return replace1.replace('<script type="module">', '<script src="./iife-Editor.js"></script><script>')
          }
        },
        { src: 'src/editor/images', dest },
        { src: 'src/editor/components/jgraduate/images', dest: dest.map((d) => `${d}/components/jgraduate`) },
        { src: 'src/editor/extensions/ext-shapes/shapelib', dest: dest.map((d) => `${d}/extensions/ext-shapes`) },
        { src: 'src/editor/embedapi.html', dest },
        { src: 'src/editor/embedapi.js', dest },
        { src: 'src/editor/browser-not-supported.html', dest },
        { src: 'src/editor/browser-not-supported.js', dest },
        { src: 'src/editor/svgedit.css', dest }
      ]
    }),
    html({
      include: [
        'src/editor/panels/*.html',
        'src/editor/templates/*.html',
        'src/editor/dialogs/*.html'
      ]
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    dynamicImportVars({ include: 'src/editor/locale.js' }),
    babel({ babelHelpers: 'bundled', exclude: [/\/core-js\//] }), // exclude core-js to avoid circular dependencies.
    terser({ keep_fnames: true }), // keep_fnames is needed to avoid an error when calling extensions.
    filesize()
  ]
}]

// config for dynamic extensions
extensionDirs.forEach((extensionDir) => {
  const extensionName = path.basename(extensionDir)
  extensionName && config.push(
    {
      input: `./src/editor/extensions/${extensionName}/${extensionName}.js`,
      output: [
        {
          format: 'es',
          dir: `dist/editor/extensions/${extensionName}`,
          inlineDynamicImports: true,
          sourcemap: true
        }
      ],
      plugins: [
        url({
          include: ['**/*.svg', '**/*.xml'],
          limit: 0,
          fileName: '[name][extname]'
        }),
        html({
          include: [
            'src/editor/extensions/*/*.html'
          ]
        }),
        nodeResolve({
          browser: true,
          preferBuiltins: true
        }),
        commonjs({ exclude: `src/editor/extensions/${extensionName}/${extensionName}.js` }),
        dynamicImportVars({ include: `src/editor/extensions/${extensionName}/${extensionName}.js` }),
        babel({ babelHelpers: 'bundled', exclude: [/\/core-js\//] }),
        terser({ keep_fnames: true })
      ]
    }
  )
})

export default config
