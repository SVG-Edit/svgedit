const { defineConfig } = require('cypress')

module.exports = defineConfig({
  video: false,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 120000,
  includeShadowDom: true,
  scrollBehavior: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents (on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8000',
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*']
  }
})
