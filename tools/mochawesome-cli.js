/* eslint-disable no-console -- mocha script can use the console */
// Filed the following to support this file's functionality:
//    https://github.com/cypress-io/cypress/issues/6585

// Todo: Show /test (i.e., `unit.js`) test results at beginning?

// See https://github.com/jsdoc/jsdoc/issues/1750 to create such tags
/* eslint "jsdoc/check-tag-names": ["error", {definedTags: ["cli-arg"]}] --
  we want a custom tag */
/**
 * @file A CLI reporter against after-the-fact compiled (merged Mochawesome)
 * Mocha results.
 * @cli-arg {"doc"|"dot"|"json-stream"|"json"|"landing"|"list"|
 * "markdown"|"min"|"nyan"|"progress"|"spec"|"tap"|
 * "xunit"} [0="spec"] The Mocha reporter to use
 */

'use strict';

const reporterFile = process.argv[2]
  ? process.argv[2].replace(/^--/u, '')
  : 'spec';

const path = '../mochawesome.json';

// eslint-disable-next-line import/no-dynamic-require -- Allow CLI to change
const MochaReporter = require(`mocha/lib/reporters/${reporterFile}.js`);
const Suite = require('mocha/lib/suite.js');
const Test = require('mocha/lib/test.js');
const Runner = require('mocha/lib/runner.js');

const {constants: {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_TEST_PENDING
}} = require('mocha/lib/runner.js');

// eslint-disable-next-line max-len -- Won't let us make next line multiline
// eslint-disable-next-line import/no-dynamic-require -- Not fixed now, but may allow changing
const {results, stats} = require(path);

const runner = new Runner(
  new Suite('', null, true)
);
runner.stats = stats;

console.log('Mocha results:');

// eslint-disable-next-line no-new -- Has side effects
new MochaReporter(runner);

runner.emit(EVENT_RUN_BEGIN);
results.forEach(({suites}) => {
  suites.forEach(function handleSuite (st) {
    const ste = Object.assign(new Suite(''), st);

    ste.suites.forEach((s, i) => {
      ste.suites[i] = handleSuite(s);
    });

    runner.emit(EVENT_SUITE_BEGIN, ste);
    ste.tests.forEach((ts) => {
      const tst = new Test('', () => {
        //
      });
      Object.entries(ts).forEach(([k, v]) => {
        // `fullTitle` is a string in mochawesome but a function in Mocha
        if (k !== 'fullTitle') {
          tst[k] = v;
        }
      });
      tst.parent = ste; // Seems to work
      const ev = tst.pass
        ? EVENT_TEST_PASS
        : tst.fail
          ? EVENT_TEST_FAIL
          // No distinct event for pending vs. skipped?
          : tst.pending
            ? EVENT_TEST_PENDING
            : tst.skipped
              ? EVENT_TEST_PENDING
              : null;
      if (!ev) {
        throw new Error(
          'Unexpected test event (not passing, failing, or pending): ' +
          tst.title
        );
      }

      runner.emit(ev, tst, tst.fail ? tst.err : undefined);
    });
    runner.emit(EVENT_SUITE_END, ste);

    return ste;
  });
});
runner.emit(EVENT_RUN_END);

const {
  // passes, tests, pending,
  end
} = stats;

/*
console.log(
  `Passing ${passes}/${tests}${pending ? `Pending ${pending}` : ''}`
);
*/
const endDate = new Date(Date.parse(end));
const lastRan = new Intl.DateTimeFormat('en-US', {
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric'
}).format(endDate);

console.log(
  `Tests finished: ${lastRan}`
);
