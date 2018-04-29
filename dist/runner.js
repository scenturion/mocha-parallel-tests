"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const mocha_1 = require("mocha");
global.describe = () => { };
// @ts-ignore
const test = require('./sample-test');
const mocha = new mocha_1.default();
mocha.addFile('./sample-test');
// task: run sample-test.js with mocha, catch its events, propagate them
//# sourceMappingURL=runner.js.map