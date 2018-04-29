import * as debug from 'debug';
import { randomBytes } from 'crypto';

export function randomId(): string {
  return randomBytes(16).toString('hex');
}

export function logging(processType: 'main' | 'subprocess', namespace: string) {
  return debug(`mocha-parallel-tests:${processType}:${namespace}`);
}
