/* eslint-env qunit */

/* eslint-disable import/unambiguous */

// Todo: Incomplete!

// log function
QUnit.log((details) => {
  if (window.console && window.console.log) {
    window.console.log(details.result + ' :: ' + details.message);
  }
});
