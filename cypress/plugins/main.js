// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

import codeCoverageTask from '@cypress/code-coverage/task.js';
import {initPlugin} from 'cypress-plugin-snapshots/plugin.js';

export default (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // https://docs.cypress.io/guides/tooling/code-coverage.html#Install-the-plugin
  codeCoverageTask(on, config);
  initPlugin(on, config);
  return config;
};
