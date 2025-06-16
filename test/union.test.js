'use strict';

const t = require('tap');
const makeTest = require('./make-test');
const { z } = require('zod/v4');

const tests = [
  {
    name: 'simple union - ok',
    schema: {
      type: 'object',
      required: ['REDIS'],
      properties: {
        REDIS: {
          anyOf: [
            {
              type: 'object',
              properties: {
                URL: {
                  type: 'string',
                },
              },
              required: ['URL'],
              additionalProperties: {},
            },
            {
              type: 'object',
              properties: {
                HOST: {
                  type: 'string',
                },
                PORT: {
                  type: 'number',
                },
              },
              required: ['HOST', 'PORT'],
              additionalProperties: false,
            },
          ],
        },
      },
    },
    data: {
      REDIS_URL: 'redis://localhost:6379',
    },
    isOk: true,
    confExpected: {
      REDIS: {
        URL: 'redis://localhost:6379',
      },
    },
  },
  {
    name: 'simple union - ok - with second',
    schema: {
      type: 'object',
      required: ['REDIS'],
      properties: {
        REDIS: {
          anyOf: [
            {
              type: 'object',
              properties: {
                URL: {
                  type: 'string',
                },
              },
              required: ['URL'],
              additionalProperties: {},
            },
            {
              type: 'object',
              properties: {
                HOST: {
                  type: 'string',
                },
                PORT: {
                  type: 'number',
                },
              },
              required: ['HOST', 'PORT'],
              additionalProperties: false,
            },
          ],
        },
      },
    },
    data: {
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
    },
    isOk: true,
    confExpected: {
      REDIS: {
        HOST: 'localhost',
        PORT: 6379,
      },
    },
  },
  {
    name: 'simple union - ok - with both',
    schema: {
      type: 'object',
      required: ['REDIS'],
      properties: {
        REDIS: {
          anyOf: [
            {
              type: 'object',
              properties: {
                URL: {
                  type: 'string',
                },
              },
              required: ['URL'],
              additionalProperties: {},
            },
            {
              type: 'object',
              properties: {
                HOST: {
                  type: 'string',
                },
                PORT: {
                  type: 'number',
                },
              },
              required: ['HOST', 'PORT'],
              additionalProperties: false,
            },
          ],
        },
      },
    },
    data: {
      REDIS_URL: 'redis://localhost:6379',
      REDIS_HOST: 'localhost',
      REDIS_PORT: 6379,
    },
    isOk: true,
    confExpected: {
      REDIS: {
        URL: 'redis://localhost:6379',
        HOST: 'localhost',
        PORT: 6379,
      },
    },
  },
  // TODO: https://github.com/ajv-validator/ajv/issues/127
  // {
  //   name: 'simple union - ok - with default',
  //   schema: {
  //     type: 'object',
  //     required: ['REDIS'],
  //     properties: {
  //       REDIS: {
  //         anyOf: [
  //           {
  //             type: 'object',
  //             properties: {
  //               URL: {
  //                 type: 'string',
  //               },
  //             },
  //             required: ['URL'],
  //           },
  //           {
  //             type: 'object',
  //             properties: {
  //               HOST: {
  //                 type: 'string',
  //               },
  //               PORT: {
  //                 type: 'number',
  //                 default: 6379,
  //               },
  //             },
  //             required: ['HOST', 'PORT'],
  //             additionalProperties: false,
  //           },
  //         ],
  //       },
  //     },
  //   },
  //   data: {
  //     REDIS_HOST: 'localhost',
  //   },
  //   isOk: true,
  //   confExpected: {
  //     REDIS: {
  //       HOST: 'localhost',
  //       PORT: 6379,
  //     },
  //   },
  // },
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
