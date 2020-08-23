/* eslint-env node */
import {join, basename} from 'path';
import {lstatSync, readdirSync} from 'fs';
import rimraf from 'rimraf';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import nodePolyfills from 'rollup-plugin-node-polyfills';

const isDirectory = (source) => {
  return lstatSync(source).isDirectory();
};
const getDirectories = (source) => {
  return readdirSync(source).map((nme) => join(source, nme)).filter((i) => isDirectory(i));
};

const localeFiles = readdirSync('src/editor/locale');
const extensionFiles = readdirSync('src/editor/extensions');

const extensionLocaleDirs = getDirectories('src/editor/extensions/ext-locale');
const extensionLocaleFiles = [];
extensionLocaleDirs.forEach((dir) => {
  readdirSync(dir).forEach((file) => {
    extensionLocaleFiles.push([dir, file]);
  });
});

// eslint-disable-next-line no-console
rimraf('./dist', () => console.info('recreating dist'));

// main config: build svgedit and
const config = [{
  input: 'src/editor/index.js',
  output: [
    {
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: true,
      dir: 'dist/editor'
    },
    {
      format: 'system',
      dir: 'dist/editor/system',
      inlineDynamicImports: true
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
          dest: 'dist/editor/system',
          rename: 'index.html',
          transform: (contents) => contents.toString()
            .replace('<script type="module" src="index.js">',
              `<script>
              const systemJsLoaderTag = document.createElement('script');
              systemJsLoaderTag.src = './s.min.js';
              systemJsLoaderTag.addEventListener('load', function () {
                System.import('./index.js');
                });
              document.head.appendChild(systemJsLoaderTag);
              `)
        },
        {
          src: ['node_modules/systemjs/dist/s.min.js', 'node_modules/systemjs/dist/s.min.js.map'],
          dest: 'dist/editor/system'
        },
        {src: 'src/editor/images', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/common', dest: 'dist'},
        {src: 'src/external', dest: 'dist'},
        {src: 'src/editor/jquery.min.js', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/jquery-ui', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/jgraduate', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/spinbtn', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/embedapi.html', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/embedapi.js', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/browser-not-supported.html', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/redirect-on-lacking-support.js', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/redirect-on-no-module-support.js', dest: ['dist/editor', 'dist/editor/system']},
        {src: 'src/editor/svgedit.css', dest: ['dist/editor', 'dist/editor/system']}
      ]
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: true
    }),
    commonjs(),
    babel({babelHelpers: 'bundled'}),
    nodePolyfills()
  ]
}];

extensionFiles.forEach((extensionFile) => {
  const extensionName = extensionFile.match(/^ext-(.+?)\.js$/);
  extensionName && config.push(
    {
      input: `./src/editor/extensions/${extensionFile}`,
      treeshake: false,
      output: [
        {
          format: 'es',
          dir: 'dist/editor/extensions',
          inlineDynamicImports: true,
          sourcemap: true
        },
        {
          format: 'system',
          dir: 'dist/editor/system/extensions',
          inlineDynamicImports: true
        }
      ],
      plugins: [
        nodeResolve({
          browser: true,
          preferBuiltins: true
        }),
        commonjs(),
        babel({babelHelpers: 'bundled'}),
        nodePolyfills()
      ]
    }
  );
});

localeFiles.forEach((localeFile) => {
  const localeRegex = /^lang\.([\w-]+?)\.js$/;
  const lang = localeFile.match(localeRegex);
  lang && config.push({
    input: `./src/editor/locale/${localeFile}`,
    treeshake: false,
    output: [
      {
        format: 'es',
        dir: 'dist/editor/locale',
        inlineDynamicImports: true
      },
      {
        format: 'system',
        dir: 'dist/editor/system/locale',
        inlineDynamicImports: true
      }
    ],
    plugins: []
  });
});

extensionLocaleFiles.forEach(([dir, file]) => {
  const lang = file.replace(/\.js$/, '').replace(/-/g, '_');
  config.push(
    {
      input: join(dir, file),
      treeshake: false,
      output: [
        {
          format: 'es',
          file: `dist/editor/extensions/ext-locale/${basename(dir)}/${lang}.js`,
          inlineDynamicImports: true
        },
        {
          format: 'system',
          file: `dist/editor/system/extensions/ext-locale/${basename(dir)}.js`,
          inlineDynamicImports: true
        }
      ],
      plugins: []
    }
  );
});

export default config;
