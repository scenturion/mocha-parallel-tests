import { RUNNABLE_IPC_PROP } from './config';

import {
  ISuite as MochaSuite,
  IRunner as MochaRunner,
  ITest as MochaTest,
  IRunnable,
  reporters,
  IContextDefinition,
} from 'mocha';
import { EventEmitter } from 'events';

export type IRunner = MochaRunner & EventEmitter;

export interface IMochaParallelTestsRunnerObject {
  [RUNNABLE_IPC_PROP]: string;
}

export interface ITest extends MochaTest, IMochaParallelTestsRunnerObject {
  body: string;
  type: 'test';
  file: string;
}

export class BaseReporter extends reporters.Base {
  runner: IRunner;
}

export interface ISuite extends MochaSuite, IMochaParallelTestsRunnerObject {
  _beforeEach: IHook[];
  _beforeAll: IHook[];
  _afterEach: IHook[];
  _afterAll: IHook[];

  root: boolean;
  suites: ISuite[];
  tests: ITest[];
}

export interface IHook extends IRunnable, IMochaParallelTestsRunnerObject {
  parent: ISuite;
  ctx: IContextDefinition;
}

export interface SubprocessRunnerMessage {
  event: string;
  data: any;
  type: 'runner';
}

export interface SubprocessOutputMessage {
  event: undefined;
  data: Buffer;
  type: 'stdout' | 'stderr';
}

export interface SubprocessTestArtifacts {
  file: string;
  suiteIndex: number;
  output: Array<SubprocessRunnerMessage | SubprocessOutputMessage>
  execTime: number;
}
