// https://github.com/DevExpress/testcafe
// https://devexpress.github.io/testcafe/documentation/test-api/
// https://github.com/helen-dikareva/axe-testcafe
import axeCheck from 'axe-testcafe';

/**
* @external AxeResult
*/
/**
 * @external TestcafeTest
*/
/**
 * @param {external.TestcafeTest} t
 * @returns {Promise<external:AxeResult>}
 */
function axeCheckWithConfig (t) {
  return axeCheck(
    t,
    // context: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#context-parameter
    undefined,
    // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#options-parameter
    {
      rules: {
        'meta-viewport': {enabled: false}
      }
    }
    // , (err, results) {} // https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#results-object
  );
}

fixture`TestCafe Axe accessibility tests (Editor - no parameters)`
  .page`http://localhost:8000/editor/svg-editor.html`;

test('Editor - no parameters', async (t) => {
  await axeCheckWithConfig(t); // , axeContent, axeOptions: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun
});

fixture`TestCafe Axe accessibility tests (Editor - with all extensions)`
  .page`http://localhost:8000/editor/svg-editor.html?extensions=ext-arrows.js,ext-closepath.js,ext-foreignobject.js,ext-helloworld.js,ext-mathjax.js,ext-php_savefile.js,ext-server_moinsave.js,ext-server_opensave.js,ext-webappfind.js,ext-xdomain-messaging.js`;

test('Editor - with all extensions', async (t) => {
  await axeCheckWithConfig(t); // , axeContent, axeOptions: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun
});

/* eslint-disable qunit/no-commented-tests */
// Waiting for https://github.com/DevExpress/testcafe-hammerhead/issues/1725 (also https://github.com/DevExpress/testcafe/issues/2734 )
/**
fixture`TestCafe Axe accessibility tests (Editor ES - no parameters)`
  .page`http://localhost:8000/editor/svg-editor-es.html`;

test('Editor ES - no parameters', async t => {
  await axeCheckWithConfig(t); // , axeContent, axeOptions: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun
});

fixture`TestCafe Axe accessibility tests (Editor ES - with all extensions)`
  .page`http://localhost:8000/editor/svg-editor-es.html?extensions=ext-arrows.js,ext-closepath.js,ext-foreignobject.js,ext-helloworld.js,ext-mathjax.js,ext-php_savefile.js,ext-server_moinsave.js,ext-server_opensave.js,ext-webappfind.js,ext-xdomain-messaging.js`;

test('Editor ES - with all extensions', async t => {
  await axeCheckWithConfig(t); // , axeContent, axeOptions: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun
});

fixture`TestCafe Axe accessibility tests (Embedded - no parameters)`
  .page`http://localhost:8000/editor/embedapi.html`;

test('Embedded - no parameters', async t => {
  await axeCheckWithConfig(t); // , axeContent, axeOptions: https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#api-name-axerun
});
*/
/* eslint-enable qunit/no-commented-tests */
