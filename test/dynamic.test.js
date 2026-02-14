'use strict';

const t = require('tap');
const makeTest = require('./make-test');

const tests = [
  {
    name: 'dynamic property names - additionalProperties schema',
    schema: {
      type: 'object',
      properties: {
        BOT: {
          type: 'object',
          propertyNames: {
            type: 'string',
          },
          additionalProperties: {
            type: 'object',
            properties: {
              WEBHOOK_SECRET: {
                type: 'string',
              },
              IMAGE: {
                type: 'string',
              },
              ENV: {
                type: 'object',
                propertyNames: {
                  type: 'string',
                },
                additionalProperties: {
                  type: 'string',
                },
              },
            },
            required: ['WEBHOOK_SECRET', 'IMAGE'],
            additionalProperties: false,
          },
        },
      },
    },
    data: {
      BOT_MYBOT_WEBHOOK_SECRET: 'secret1',
      BOT_MYBOT_IMAGE: 'img1',
      BOT_MYBOT_ENV_FOO: 'bar',
      BOT_MYBOT_ENV_BAZ: 'qux',
      BOT_OTHER_WEBHOOK_SECRET: 'secret2',
      BOT_OTHER_IMAGE: 'img2',
    },
    isOk: true,
    confExpected: {
      BOT: {
        MYBOT: {
          WEBHOOK_SECRET: 'secret1',
          IMAGE: 'img1',
          ENV: {
            FOO: 'bar',
            BAZ: 'qux',
          },
        },
        OTHER: {
          WEBHOOK_SECRET: 'secret2',
          IMAGE: 'img2',
          ENV: {},
        },
      },
    },
  },
  {
    name: 'dynamic property names - mixed fixed and dynamic properties',
    schema: {
      type: 'object',
      properties: {
        SERVICE: {
          type: 'object',
          properties: {
            VERSION: {
              type: 'string',
            },
          },
          required: ['VERSION'],
          additionalProperties: {
            type: 'object',
            properties: {
              URL: {
                type: 'string',
              },
              PORT: {
                type: 'integer',
              },
            },
            required: ['URL'],
            additionalProperties: false,
          },
        },
      },
    },
    data: {
      SERVICE_VERSION: '2.0',
      SERVICE_API_URL: 'http://api.local',
      SERVICE_API_PORT: '8080',
      SERVICE_WEB_URL: 'http://web.local',
    },
    isOk: true,
    confExpected: {
      SERVICE: {
        VERSION: '2.0',
        API: {
          URL: 'http://api.local',
          PORT: 8080,
        },
        WEB: {
          URL: 'http://web.local',
        },
      },
    },
  },
  {
    name: 'dynamic property names - simple string values',
    schema: {
      type: 'object',
      properties: {
        FEATURE: {
          type: 'object',
          additionalProperties: {
            type: 'string',
          },
        },
      },
    },
    data: {
      FEATURE_ALPHA: 'on',
      FEATURE_BETA: 'off',
    },
    isOk: true,
    confExpected: {
      FEATURE: {
        ALPHA: 'on',
        BETA: 'off',
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
