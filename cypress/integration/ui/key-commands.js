import {
  visitAndApproveStorage
} from '../../support/ui-test-helper.js';

// See https://github.com/SVG-Edit/svgedit/issues/364
describe('Key commands', function () {
  beforeEach(() => {
    visitAndApproveStorage();
  });

  it('ctrl-A causes error', function () {
    cy.get('body').type('{cmd}a');
  });
});
