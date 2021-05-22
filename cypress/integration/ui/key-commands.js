import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js';

// See https://github.com/SVG-Edit/svgedit/issues/364
describe('Key commands', function () {
  beforeEach(() => {
    visitAndApproveStorage();
  });

  it.skip('cmd-A on empty canvas should not cause an error', function () {
    cy.get('body').type('{cmd}a');
  });
});
