import * as assert from 'assert';
import { fork } from 'child_process';
import { resolve as pathResolve } from 'path';

import * as debug from 'debug';
import * as CircularJSON from 'circular-json';
import * as Mocha from 'mocha';

import {
  ISuite,
  SubprocessRunnerMessage,
  SubprocessTestArtifacts,
} from '../interfaces';
import RunnerMain from './runner';
import { logging } from '../util';

const debugLog = logging('main', 'index');

function spawnTestProcess(file, suiteIndex) {
  return new Promise((resolve, reject) => {
    const runnerPath = pathResolve(__dirname, '../subprocess/runner.ts');
    const test = fork(runnerPath, ['--test', file, '--suite', suiteIndex], {
      stdio: ['ipc'],
    });

    debugLog(`Process spawned. You can run it manually with this command:`);
    debugLog(`ts-node ${runnerPath} ${['--test', file, '--suite', suiteIndex].join(' ')}`);

    const output: any = [];
    const startedAt = Date.now();

    test.on('message', function onMessageHandler({ event, data }) {
      output.push({
        event,
        data,
        type: 'runner',
      });
    });

    test.stdout.on('data', function (data) {
      output.push({
        data,
        type: 'stdout',
      });
    });

    test.stderr.on('data', function (data) {
      output.push({
        data,
        type: 'stderr',
      });
    });

    test.on('close', function (code) {
      // TODO
      debugLog('runner exited with code ' + code);

      resolve({
        file,
        suiteIndex,
        output,
        execTime: Date.now() - startedAt,
      });
    });
  });
}

function calcTopLevelSuitesInFile(file: string): number {
  const mocha = new Mocha();
  mocha.timeout(5000);
  mocha.addFile(file);

  (mocha as any).loadFiles(); // emits post-require
  return (mocha as any).suite.suites.length;
}

function findRootSuite(testArtifacts: SubprocessTestArtifacts): ISuite {
  const endRunnerMessage = testArtifacts.output.find(({ event, type, data }) => {
    return type === 'runner' && event === 'end';
  }) as SubprocessRunnerMessage;

  assert(
    endRunnerMessage,
    `Subprocess ${testArtifacts.file}{${testArtifacts.suiteIndex}} didn't send an "end" message`,
  );

  return CircularJSON.parse(endRunnerMessage.data.rootSuite);
}

function addSubprocessSuites(rootSuite: ISuite, testArtifacts: SubprocessTestArtifacts): void {
  const testRootSuite = findRootSuite(testArtifacts);

  rootSuite.suites.push({
    ...testRootSuite,
    root: false,
    parent: rootSuite,
  });
}

const files = [
  `${__dirname}/../sample-test.js`,
  `${__dirname}/../sample-test2.js`,
];

const tests: any = [];
for (const file of files) {
  const topLevelSuites = calcTopLevelSuitesInFile(file);

  for (let suiteIndex = 0; suiteIndex < topLevelSuites; suiteIndex++) {
    const test = spawnTestProcess(file, suiteIndex);
    tests.push(test);
  }
}

Promise.all<SubprocessTestArtifacts>(tests).then((res) => {
  const mocha = new Mocha();
  const rootSuite = mocha.suite as ISuite;

  // merge data from subprocess tests into the root suite
  for (const testTesult of res) {
    addSubprocessSuites(rootSuite, testTesult);
  }

  const reporter = new mocha._reporter(
    new RunnerMain(rootSuite, res),
    mocha.options
  );
});
