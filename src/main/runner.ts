import * as assert from 'assert';
import * as EventEmitter from 'events';

import { RUNNABLE_IPC_PROP } from '../config';
import { ISuite, SubprocessTestArtifacts, ITest, IHook } from '../interfaces';

export default class RunnerMain extends EventEmitter {
  private rootSuite: ISuite;
  private testResults: SubprocessTestArtifacts[];

  constructor(rootSuite: ISuite, testResults: SubprocessTestArtifacts[]) {
    super();

    this.rootSuite = rootSuite;
    this.testResults = testResults;

    process.nextTick(() => this.emitEvents());
  }

  private findSuiteById(id: string, rootSuite: ISuite = this.rootSuite): ISuite | null {
    if (rootSuite[RUNNABLE_IPC_PROP] === id) {
      return rootSuite;
    }

    for (const suite of rootSuite.suites) {
      const inner = this.findSuiteById(id, suite);
      if (inner) {
        return inner;
      }
    }

    return null;
  }

  private findTestById(id: string, rootSuite: ISuite = this.rootSuite): ITest | null {
    for (const test of rootSuite.tests) {
      if (test[RUNNABLE_IPC_PROP] === id) {
        return test;
      }
    }

    for (const suite of rootSuite.suites) {
      const inner = this.findTestById(id, suite);
      if (inner) {
        return inner;
      }
    }

    return null;
  }

  private findHookById(id: string, rootSuite: ISuite = this.rootSuite): IHook | null {
    for (const hookType of ['_beforeEach', '_beforeAll', '_afterEach', '_afterAll']) {
      for (const hook of rootSuite[hookType]) {
        if (hook.id === id) {
          return hook;
        }
      }
    }

    for (const suite of rootSuite.suites) {
      const inner = this.findHookById(id, suite);
      if (inner) {
        return inner;
      }
    }

    return null;
  }

  private emitEvents() {
    this.emit('start');
    this.emit('suite', this.rootSuite);

    for (const testArtifacts of this.testResults) {
      this.emitSubprocessEvents(testArtifacts);
    }

    this.emit('suite end', this.rootSuite);
    this.emit('end');
  }

  private emitSubprocessEvents(testArtifacts: SubprocessTestArtifacts) {
    for (const { event, data, type } of testArtifacts.output) {
      if (type === 'runner') {
        switch (event) {
          // TODO
          // runner.on('waiting', this.onRunnerWaiting);

          case 'suite':
          case 'suite end': {
            const suite = this.findSuiteById(data.id);
            assert(suite, `Couldn't find suite by id: ${data.id}`);

            this.emit(event, suite);
            break;
          }

          case 'test':
          case 'test end':
          case 'pending':
          case 'pass': {
            const test = this.findTestById(data.id);
            assert(test, `Couldn't find test by id: ${data.id}`);

            // TODO
            test.slow = () => 0;
            test.fullTitle = () => 'foo';

            this.emit(event, test);
            break;
          }

          case 'fail': {
            const test = this.findTestById(data.id);
            assert(test, `Couldn't find test by id: ${data.id}`);

            // TODO
            test.slow = () => 0;
            test.fullTitle = () => 'foo';

            this.emit(event, test, data.err);
            break;
          }

          case 'hook':
          case 'hook end': {
            const hook = this.findHookById(data.id);

            // TODO
            if (hook) {
              this.emit(event, hook);
            } else {
              // console.warn(`Couldn't find hook by id: ${data.id}`);
              this.emit(event, {});
            }

            break;
          }
        }
      } else {
        process[type].write(data);
      }
    }
  }
}
