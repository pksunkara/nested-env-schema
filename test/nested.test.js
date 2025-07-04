'use strict';

const t = require('tap');
const makeTest = require('./make-test');

process.env.K8S_NAMESPACE = 'pippo';
process.env.K8S_CLUSTER_ID = 'pluto';
process.env.K8S_CLUSTER_PASS = 'neptune';

const tests = [
  {
    name: 'simple nested object - ok',
    schema: {
      type: 'object',
      properties: {
        REDIS: {
          type: 'object',
          properties: {
            URL: {
              type: 'string',
            },
          },
        },
      },
    },
    isOk: true,
    confExpected: {
      REDIS: {},
    },
  },
  {
    name: 'simple nested object - ok - with default',
    schema: {
      type: 'object',
      properties: {
        REDIS: {
          type: 'object',
          properties: {
            URL: {
              type: 'string',
              default: 'redis://localhost:6379',
            },
          },
        },
      },
    },
    isOk: true,
    confExpected: {
      REDIS: {
        URL: 'redis://localhost:6379',
      },
    },
  },
  {
    name: 'simple nested object - ok - one level',
    schema: {
      type: 'object',
      properties: {
        K8S: {
          type: 'object',
          properties: {
            NAMESPACE: {
              type: 'string',
            },
          },
        },
      },
    },
    isOk: true,
    confExpected: {
      K8S: {
        NAMESPACE: 'pippo',
      },
    },
  },
  {
    name: 'simple nested object - ok - more levels',
    schema: {
      type: 'object',
      properties: {
        K8S: {
          type: 'object',
          properties: {
            NAMESPACE: {
              type: 'string',
            },
            CLUSTER: {
              type: 'object',
              properties: {
                ID: {
                  type: 'string',
                },
                PASS: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
    isOk: true,
    confExpected: {
      K8S: {
        NAMESPACE: 'pippo',
        CLUSTER: {
          ID: 'pluto',
          PASS: 'neptune',
        },
      },
    },
  },
  {
    name: 'simple nested object - ok - without properties',
    schema: {
      type: 'object',
      properties: {
        K8S: {
          type: 'object',
        },
      },
    },
    isOk: true,
    confExpected: {
      K8S: {
        NAMESPACE: 'pippo',
        CLUSTER_ID: 'pluto',
        CLUSTER_PASS: 'neptune',
      },
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
