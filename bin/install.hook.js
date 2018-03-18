#!/usr/bin/env node

const { renameSync } = require('fs');
const { resolve } = require('path');
const debug = require('debug');

const log = debug('mocha-parallel-tests:postinstall');

function removeMocha() {
  const oldPath = resolve(__dirname, '../node_modules/mocha');
  const newPath = resolve(__dirname, '../node_modules/__mocha');

  renameSync(oldPath, newPath);
}

function downloadMochaBundles() {
  const niv = require('npm-install-version');

  niv.install('mocha@5');
  niv.install('mocha@4');
  niv.install('mocha@3');
}

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
  downloadMochaBundles();

  log('Preparation is finished');
}

main();
