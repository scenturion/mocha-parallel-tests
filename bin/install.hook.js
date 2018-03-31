#!/usr/bin/env node

const debug = require('debug');
const niv = require('npm-install-version');

const log = debug('mocha-parallel-tests:postinstall');

/**
 * Dirtiest hack possible.
 * Allows to bind to local "npm install" without arguments,
 * change "node_modules" tree and do whatever we want with dependencies
 */
function main() {
  if (!process.env.npm_package_gitHead) {
    return;
  }

  log('Detected npm install without arguments');

  log('Download mocha v3, 4 and 5 latest bundles');
  niv.install('mocha@5');
  niv.install('mocha@4');
  niv.install('mocha@3');

  log('Preparation is finished');
}

main();
