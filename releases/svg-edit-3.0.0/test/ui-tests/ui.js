// https://github.com/DevExpress/testcafe
// https://devexpress.github.io/testcafe/documentation/test-api/
// https://github.com/helen-dikareva/axe-testcafe
import {Selector} from 'testcafe';

fixture`TestCafe UI tests`
  .page`http://localhost:8000/editor/svg-editor.html`;

test('Editor - No parameters: Export button', async t => {
  await t
    .click('#dialog_buttons > input[type=button][value=OK]')
    .click('#main_icon')
    .expect(Selector('#tool_export')).ok('Has open button');
});

test('Editor - No parameters: Export button clicking', async t => {
  await t
    .click('#dialog_buttons > input[type=button][value=OK]')
    .click('#main_icon')
    .click('#tool_export')
    .expect(Selector('#dialog_content select')).ok('Export dialog opens');
});
