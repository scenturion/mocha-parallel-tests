#!/usr/bin/env node

const { reporters } = require('mocha');
const Mocha = require('mocha');

class Reporter extends reporters.Base {
  constructor(runner) {
    super(runner);

    this.level = 0;
    const emit = runner.emit.bind(runner);

    runner.emit = (...args) => {
      switch (args[0]) {
        case 'start':
          this.level++;
          console.log('start');
          break;

        case 'end':
          this.level--;
          console.log('end');
          break;

        case 'suite':
          console.log(this.indent() + 'suite: ' + args[1].title);
          this.level++;
          break;

        case 'pass':
        case 'test':
        case 'test end':
          console.log(this.indent() + args[0] + ': ' + args[1].title);
          break;

        case 'fail':
          console.log(this.indent() + 'fail: ' + args[1].title + ' (' + args[2].message + ')');
          break;

        case 'suite end':
          this.level--;
          console.log(this.indent() + args[0]);
          break;

        default:
          console.log(this.indent() + args[0]);
          break;
      }

      emit(...args);
    };

    // runner.on('start', function () {
    //   console.log('start from reporter');
    // });

    // runner.on('end', function () {
    //   console.log('end from reporter');
    // });
  }

  indent() {
    return ''.padStart(this.level * 2, ' ');
  }
}

const filePath = process.argv[3];
const suiteIndex = process.argv[5];

const mocha = new Mocha();
mocha.timeout(10000);
mocha.addFile(filePath);

mocha.suite.once('post-require', () => {
  mocha.suite.suites = [mocha.suite.suites[suiteIndex]];
});

mocha.loadFiles(); // emits post-require
const runner = mocha.reporter(Reporter).run(); // runs loadFils which emits post-require

// @ts-ignore
// runner.on('start', function () {
//   console.log('start from runner');
// })

// // @ts-ignore
// runner.on('end', function () {
//   console.log('end from runner');
// })

// task: run sample-test.js with mocha, catch its events, propagate them

