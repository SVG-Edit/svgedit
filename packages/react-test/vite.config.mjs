import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    loader: 'jsx',
    include: /src\/.*\.js$/
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: ['es'],
      fileName: () => 'react-test.js'
    }
  }
})
