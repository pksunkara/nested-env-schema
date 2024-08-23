'use strict';

const t = require('tap');
const makeTest = require('./make-test');
const { join } = require('node:path');

process.env.K8S_NAMESPACE = 'pippo';
process.env.K8S_CLUSTERID = 'pluto';
process.env.URL = 'https://prefix.$K8S_NAMESPACE.$K8S_CLUSTERID.my.domain.com';
process.env.PASSWORD = 'password';

const tests = [
  {
    name: 'simple object - ok - expansion does not work',
    schema: {
      type: 'object',
      properties: {
        URL: {
          type: 'string',
        },
        K8S_NAMESPACE: {
          type: 'string',
        },
      },
    },
    isOk: true,
    confExpected: {
      URL: 'https://prefix.$K8S_NAMESPACE.$K8S_CLUSTERID.my.domain.com',
      K8S_NAMESPACE: 'pippo',
    },
  },
  {
    name: 'simple object - ok - expansion works with env files',
    schema: {
      type: 'object',
      properties: {
        URL: {
          type: 'string',
        },
        EXPANDED_VALUE_FROM_DOTENV: {
          type: 'string',
        },
      },
    },
    isOk: true,
    dotenv: { path: join(__dirname, '.env') },
    confExpected: {
      URL: 'https://prefix.$K8S_NAMESPACE.$K8S_CLUSTERID.my.domain.com',
      EXPANDED_VALUE_FROM_DOTENV: 'the password is password!',
    },
  },
  {
    name: 'simple object - ok - expansion does not work when passed an arbitrary new object based on process.env as data',
    schema: {
      type: 'object',
      properties: {
        URL: {
          type: 'string',
        },
        K8S_NAMESPACE: {
          type: 'string',
        },
      },
    },
    isOk: true,
    data: {
      ...process.env,
      K8S_NAMESPACE: 'hello',
    },
    confExpected: {
      URL: 'https://prefix.$K8S_NAMESPACE.$K8S_CLUSTERID.my.domain.com',
      K8S_NAMESPACE: 'hello',
    },
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
