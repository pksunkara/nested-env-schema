'use strict';

const envSchema = require('../lib/index');

function makeTest(t, options, isOk, confExpected, errorMessage) {
  const originalEnv = Object.assign({}, process.env);

  t.plan(1);
  options = Object.assign({ confKey: 'config' }, options);

  try {
    const conf = envSchema(options);
    t.strictSame(conf, confExpected);
  } catch (err) {
    if (isOk) {
      t.fail(err);
      return;
    }
    t.strictSame(err.message, errorMessage);
  } finally {
    process.env = Object.assign({}, originalEnv);
  }
}

module.exports = makeTest;
