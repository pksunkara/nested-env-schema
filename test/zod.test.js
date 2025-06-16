'use strict';

const t = require('tap');
const makeTest = require('./make-test');
const { z } = require('zod/v4');

process.env.K8S_NAMESPACE = 'pippo';
process.env.K8S_CLUSTER_ID = 'pluto';
process.env.K8S_CLUSTER_PASS = 'neptune';

const tests = [
  {
    name: 'simple object - ok',
    schema: z.toJSONSchema(
      z.object({
        PORT: z.string(),
      }),
    ),
    data: {
      PORT: '44',
    },
    isOk: true,
    confExpected: {
      PORT: '44',
    },
  },
  {
    name: 'simple object - ok - use default',
    schema: z.toJSONSchema(
      z.object({
        PORT: z.number().default(5555),
      }),
    ),
    data: {},
    isOk: true,
    confExpected: {
      PORT: 5555,
    },
  },
  {
    name: 'simple object - KO',
    schema: z.toJSONSchema(
      z.object({
        PORT: z.number(),
      }),
    ),
    data: {},
    isOk: false,
    errorMessage: "env must have required property 'PORT'",
  },
  {
    name: 'simple nested object - ok',
    schema: z.toJSONSchema(
      z.object({
        REDIS: z.object({
          URL: z.string().optional(),
        }),
      }),
    ),
    isOk: true,
    confExpected: {
      REDIS: {},
    },
  },
  {
    name: 'simple nested object - ok - with default',
    schema: z.toJSONSchema(
      z.object({
        REDIS: z.object({
          URL: z.string().default('redis://localhost:6379'),
        }),
      }),
    ),
    isOk: true,
    confExpected: {
      REDIS: {
        URL: 'redis://localhost:6379',
      },
    },
  },
  {
    name: 'simple nested object - ok - one level',
    schema: z.toJSONSchema(
      z.object({
        K8S: z.object({
          NAMESPACE: z.string(),
        }),
      }),
    ),
    isOk: true,
    confExpected: {
      K8S: {
        NAMESPACE: 'pippo',
      },
    },
  },
  {
    name: 'simple nested object - ok - without properties',
    schema: z.toJSONSchema(
      z.object({
        K8S: z.object().loose(),
      }),
    ),
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
