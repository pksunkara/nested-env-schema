# nested-env-schema

[![CI](https://github.com/pksunkara/nested-env-schema/workflows/CI/badge.svg)](https://github.com/pksunkara/nested-env-schema/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/nested-env-schema.svg?style=flat)](https://www.npmjs.com/package/nested-env-schema)

Validate & extract your env variables using nested [JSON schema](https://json-schema.org/), [Ajv](http://npm.im/ajv) and
[dotenv](http://npm.im/dotenv).

## Install

```
yarn add nested-env-schema
```

## Usage

```js
const envSchema = require('nested-env-schema');

const schema = {
  type: 'object',
  required: ['PORT', 'SENTRY'],
  properties: {
    // Reads the `PORT` env var
    PORT: {
      type: 'number',
      default: 3000,
    },
    SENTRY: {
      type: 'object',
      required: ['ENABLED', 'DSN'],
      properties: {
        // Reads the `SENTRY_ENABLED` env var
        ENABLED: {
          type: 'boolean',
          default: false,
        },
        // Reads the `SENTRY_DSN` env var
        DSN: {
          type: 'string'
          default: 'something',
        },
      },
    },
  },
};

const config = envSchema({
  schema: schema,
  data: data, // optional, default: process.env
  dotenv: true, // load .env if it is there, default: false
  // or you can pass DotenvConfigOptions
  // dotenv: {
  //   path: '/custom/path/to/.env'
  // }
});

console.log(config);
// output: { PORT: 3000, SENTRY: { ENABLED: false, DSN: 'something' } }
```

see [DotenvConfigOptions](https://github.com/motdotla/dotenv#options)

### Custom ajv instance

Optionally, the user can supply their own ajv instance:

```js
const envSchema = require('nested-env-schema');
const Ajv = require('ajv');

const schema = {
  type: 'object',
  required: ['PORT'],
  properties: {
    PORT: {
      type: 'number',
      default: 3000,
    },
  },
};

const config = envSchema({
  schema: schema,
  data: data,
  dotenv: true,
  ajv: new Ajv({
    allErrors: true,
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allowUnionTypes: true,
  }),
});

console.log(config);
// output: { PORT: 3000 }
```

It is possible to enhance the default ajv instance providing the `customOptions` function parameter.
This example shows how to use the `format` keyword in your schemas.

```js
const config = envSchema({
  schema: schema,
  data: data,
  dotenv: true,
  ajv: {
    customOptions(ajvInstance) {
      require('ajv-formats')(ajvInstance);
      return ajvInstance;
    },
  },
});
```

Note that it is mandatory returning the ajv instance.

### Custom keywords

This library supports the following Ajv custom keywords:

#### `separator`

Type: `string`

Applies to type: `string`

When present, the provided schema value will be split on this value.

Example:

```js
const envSchema = require('nested-env-schema');

const schema = {
  type: 'object',
  required: ['ALLOWED_HOSTS'],
  properties: {
    ALLOWED_HOSTS: {
      type: 'string',
      separator: ',',
    },
  },
};

const data = {
  ALLOWED_HOSTS: '127.0.0.1,0.0.0.0',
};

const config = envSchema({
  schema: schema,
  data: data, // optional, default: process.env
  dotenv: true, // load .env if it is there, default: false
});

// config.ALLOWED_HOSTS => ['127.0.0.1', '0.0.0.0']
```

The ajv keyword definition objects can be accessed through the property `keywords` on the `envSchema` function:

```js
const envSchema = require('nested-env-schema');
const Ajv = require('ajv');

const schema = {
  type: 'object',
  properties: {
    names: {
      type: 'string',
      separator: ',',
    },
  },
};

const config = envSchema({
  schema: schema,
  data: data,
  dotenv: true,
  ajv: new Ajv({
    allErrors: true,
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allowUnionTypes: true,
    keywords: [envSchema.keywords.separator],
  }),
});

console.log(config);
// output: { names: ['foo', 'bar'] }
```

### TypeScript

You can specify the type of your `config`:

```ts
import { envSchema, JSONSchemaType } from 'nested-env-schema';

interface Env {
  PORT: number;
}

const schema: JSONSchemaType<Env> = {
  type: 'object',
  required: ['PORT'],
  properties: {
    PORT: {
      type: 'number',
      default: 3000,
    },
  },
};

const config = envSchema({
  schema,
});
```

You can also use a `JSON Schema` library like `typebox`:

```ts
import { envSchema } from 'nested-env-schema';
import { Static, Type } from '@sinclair/typebox';

const schema = Type.Object({
  PORT: Type.Number({ default: 3000 }),
});

type Schema = Static<typeof schema>;

const config = envSchema<Schema>({
  schema,
});
```

If no type is specified the `config` will have the `EnvSchemaData` type.

```ts
export type EnvSchemaData = {
  [key: string]: unknown;
};
```

## Acknowledgements

Forked from https://github.com/fastify/env-schema

## License

MIT
