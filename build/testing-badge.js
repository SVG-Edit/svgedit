'use strict';

const EventEmitter = require('events');
const BadgeGenerator = require('mocha-badge-generator');

class MockRunner extends EventEmitter {}

const {stats: {passes, failures}} = require('../mochawesome.json');

const mockRunner = new MockRunner();

const options = {
  reporterOptions: {
    badge_output: 'badges/tests-badge.svg'
  }
};

(async () => {
const p = BadgeGenerator(mockRunner, options);
mockRunner.emit('start');
for (let i = 0; i < passes; i++) {
  mockRunner.emit('pass');
}
for (let i = 0; i < failures; i++) {
  mockRunner.emit('fail');
}
mockRunner.emit('end');
await p;
})();
