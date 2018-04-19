import { spawn } from 'child_process';
import { resolve as pathResolve } from 'path';
import * as Mocha from 'mocha';
import { reporters } from 'mocha';

function spawnTestProcess(file, suiteIndex) {
  return new Promise((resolve, reject) => {
    const runnerPath = pathResolve(__dirname, 'runner.js');
    const test = spawn(runnerPath, ['--test', file, '--suite', suiteIndex]);
    const output: any = [];
    const startedAt = Date.now();

    test.stdout.on('data', function (data) {
      output.push(data.toString());
      // process.stdout.write(file + '{' + suiteIndex + '}: ' + data.toString());
    });

    test.stderr.on('data', function (data) {
      output.push(data.toString());
      // process.stderr.write(file + '{' + suiteIndex + '}: ' + data.toString());
    });

    test.on('close', function () {
      resolve({
        file,
        suiteIndex,
        output,
        execTime: Date.now() - startedAt,
      });
    });
  });
}

function calcTopLevelSuitesInFile(file) {
  const mocha = new Mocha();
  mocha.timeout(5000);
  mocha.addFile(file);

  (mocha as any).loadFiles(); // emits post-require
  return (mocha as any).suite.suites.length;
}

const files = [
  `${__dirname}/sample-test.js`,
  `${__dirname}/sample-test2.js`,
];

const tests: any = [];
for (const file of files) {
  const topLevelSuites = calcTopLevelSuitesInFile(file);

  for (let suiteIndex = 0; suiteIndex < topLevelSuites; suiteIndex++) {
    const test = spawnTestProcess(file, suiteIndex);
    tests.push(test);
  }
}

Promise.all(tests).then((res) => {
  console.log(JSON.stringify(res, null, 2));
})

// @ts-ignore
// runner.on('start', function () {
//   console.log('start from runner');
// })

// // @ts-ignore
// runner.on('end', function () {
//   console.log('end from runner');
// })

// task: run sample-test.js with mocha, catch its events, propagate them
