import { defineConfig } from 'cypress'

import fs from 'fs'
import codeCoverageTask from '@cypress/code-coverage/task.js'

export default defineConfig({
  video: false,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 120000,
  includeShadowDom: true,
  scrollBehavior: false,
  viewportWidth: 2048,
  viewportHeight: 2048,
  e2e: {
    testIsolation: false,
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents (on, config) {
      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config

      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config

      // https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
      codeCoverageTask(on, config)

      on('task', {
        readFileMaybe (filename) {
          if (fs.existsSync(filename)) {
            return fs.readFileSync(filename, 'utf8')
          }

          return null
        }
      })

      return config
    },
    env: {
      codeCoverage: {
        exclude: 'cypress/**/*.*'
      }
    },
    baseUrl: 'http://localhost:8000',
    excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*']
  }
})
