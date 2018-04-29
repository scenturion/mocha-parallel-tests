import * as CircularJSON from 'circular-json';
import * as Mocha from 'mocha';

import { RUNNABLE_IPC_PROP } from '../config';
import {
  BaseReporter,
  IHook,
  IRunner,
  ISuite,
  ITest,
} from '../interfaces';
import { randomId } from '../util';

class Reporter extends BaseReporter {
  constructor(runner: IRunner) {
    super(runner);

    runner.on('waiting', this.onRunnerWaiting);
    runner.on('start', this.onRunnerStart);
    runner.on('end', this.onRunnerEnd);

    runner.on('suite', this.onRunnerSuiteStart);
    runner.on('suite end', this.onRunnerSuiteEnd);

    runner.on('test', this.onTestStart);
    runner.on('test end', this.onTestEnd);

    runner.on('pass', this.onRunnerPass);
    runner.on('fail', this.onRunnerFail);
    runner.on('pending', this.onRunnerPending);

    runner.on('hook', this.onRunnerHookStart);
    runner.on('hook end', this.onRunnerHookEnd);
  }

  private onRunnerStart = () => {
    this.notifyParentThroughIPC('start');
  }

  private onRunnerEnd = () => {
    const rootSuite = this.runner.suite;

    this.notifyParentThroughIPC('end', {
      rootSuite: CircularJSON.stringify(rootSuite),
    });
  }

  private onRunnerSuiteStart = (suite: ISuite) => {
    const id = randomId();
    suite[RUNNABLE_IPC_PROP] = id;

    this.notifyParentThroughIPC('suite', { id });
  }

  private onRunnerSuiteEnd = (suite: ISuite) => {
    this.notifyParentThroughIPC('suite end', {
      id: suite[RUNNABLE_IPC_PROP],
    });
  }

  private onRunnerWaiting = (rootSuite: ISuite) => {
    this.notifyParentThroughIPC('waiting');
  }

  private onTestStart = (test: ITest) => {
    const id = randomId();
    test[RUNNABLE_IPC_PROP] = id;

    this.notifyParentThroughIPC('test', { id });
  }

  private onTestEnd = (test: ITest) => {
    this.notifyParentThroughIPC('test end', {
      id: test[RUNNABLE_IPC_PROP],
    });
  }

  private onRunnerPass = (test: ITest) => {
    this.notifyParentThroughIPC('pass', {
      id: test[RUNNABLE_IPC_PROP],
    });
  }

  private onRunnerFail = (test: ITest, err: Error) => {
    this.notifyParentThroughIPC('fail', {
      id: test[RUNNABLE_IPC_PROP],
      err: {
        message: err.message,
        stack: err.stack,
        name: err.name,
      },
    });
  }

  private onRunnerPending = (test: ITest) => {
    this.notifyParentThroughIPC('pending', {
      id: test[RUNNABLE_IPC_PROP],
    });
  }

  private onRunnerHookStart = (hook: IHook) => {
    const id = randomId();
    hook[RUNNABLE_IPC_PROP] = id;

    this.notifyParentThroughIPC('hook', { id });
  }

  private onRunnerHookEnd = (hook: IHook) => {
    this.notifyParentThroughIPC('hook end', {
      id: hook[RUNNABLE_IPC_PROP],
    });
  }

  private notifyParentThroughIPC(event: string, data = {}) {
    process.send!({ event, data });
  }
}

const filePath = process.argv[3];
const suiteIndex = process.argv[5];

const mocha = new Mocha();
mocha.timeout(10000);
mocha.addFile(filePath);

(mocha.suite as any).once('post-require', () => {
  mocha.suite.suites = [mocha.suite.suites[suiteIndex]];
});

mocha.loadFiles(); // emits post-require
mocha.reporter(Reporter).run(); // runs loadFils which emits post-require
