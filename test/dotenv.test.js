'use strict';

const t = require('tap');
const makeTest = require('./make-test');
const { join } = require('node:path');

const tests = [
  {
    name: 'simple object - ok - load only from .env',
    schema: {
      type: 'object',
      required: ['VALUE_FROM_DOTENV'],
      properties: {
        VALUE_FROM_DOTENV: {
          type: 'string',
        },
      },
    },
    data: undefined,
    isOk: true,
    dotenv: { path: join(__dirname, 'envs', 'normal', '.env') },
    confExpected: {
      VALUE_FROM_DOTENV: 'look ma',
    },
  },
  {
    name: 'simple object - ok - load encrypted .env as empty',
    schema: {
      type: 'object',
      properties: {
        VALUE_FROM_DOTENV: {
          type: 'string',
        },
      },
    },
    data: undefined,
    isOk: true,
    dotenv: { path: join(__dirname, 'envs', 'encrypted', '.env') },
    confExpected: {},
  },
];

tests.forEach(function (testConf) {
  t.test(testConf.name, (t) => {
    const options = {
      schema: testConf.schema,
      data: testConf.data,
      dotenv: testConf.dotenv,
      dotenvConfig: testConf.dotenvConfig,
    };

    makeTest(
      t,
      options,
      testConf.isOk,
      testConf.confExpected,
      testConf.errorMessage,
    );
  });
});
