'use strict';

const Ajv = require('ajv');
const dotenvx = require('@dotenvx/dotenvx');

const separator = {
  keyword: 'separator',
  type: 'string',
  metaSchema: {
    type: 'string',
    description: 'value separator',
  },
  modifying: true,
  valid: true,
  errors: false,
  compile:
    (schema) =>
    (data, { parentData: pData, parentDataProperty: pDataProperty }) => {
      pData[pDataProperty] = data === '' ? [] : data.split(schema);
    },
};

const optsSchema = {
  type: 'object',
  required: ['schema'],
  properties: {
    schema: { type: 'object', additionalProperties: true },
    data: {
      oneOf: [
        { type: 'array', items: { type: 'object' }, minItems: 1 },
        { type: 'object' },
      ],
      default: {},
    },
    env: { type: 'boolean', default: true },
    dotenv: { type: ['boolean', 'object'], default: false },
    ajv: { type: 'object', additionalProperties: true },
  },
};

const sharedAjvInstance = getDefaultInstance();

const optsSchemaValidator = sharedAjvInstance.compile(optsSchema);

function extractNested(properties, data) {
  Object.entries(properties).forEach(([name, propSchema]) => {
    if (propSchema.type === 'object') {
      propSchema.default ||= {};

      const possibles = Object.keys(data).filter((key) =>
        key.startsWith(`${name}_`),
      );

      data[name] = possibles.reduce(
        (acc, key) => ({
          ...acc,
          [key.replace(`${name}_`, '')]: data[key],
        }),
        {},
      );

      if (propSchema.properties) {
        propSchema.additionalProperties = false;
        extractNested(propSchema.properties, data[name]);
      }
    }
  });
}

function envSchema(_opts) {
  const opts = Object.assign({}, _opts);

  const isOptionValid = optsSchemaValidator(opts);

  if (!isOptionValid) {
    const error = new Error(
      sharedAjvInstance.errorsText(optsSchemaValidator.errors, {
        dataVar: 'opts',
      }),
    );
    error.errors = optsSchemaValidator.errors;
    throw error;
  }

  const { schema } = opts;

  // Make sure not to capture other environment variables
  schema.additionalProperties = false;

  let { data, dotenv, env } = opts;

  if (!Array.isArray(opts.data)) {
    data = [data];
  }

  if (dotenv) {
    dotenvx.config(Object.assign({}, dotenv));
  }

  /* istanbul ignore else */
  if (env) {
    // Treat encrypted values as empty
    Object.entries(process.env).forEach(([key, value]) => {
      if (value.startsWith('encrypted:')) {
        delete process.env[key];
      }
    });

    data.unshift(process.env);
  }

  const merge = {};
  data.forEach((d) => Object.assign(merge, d));

  if (schema.properties) {
    extractNested(schema.properties, merge);
  }

  const ajv = chooseAjvInstance(sharedAjvInstance, opts.ajv);

  const valid = ajv.validate(schema, merge);

  if (!valid) {
    const error = new Error(ajv.errorsText(ajv.errors, { dataVar: 'env' }));
    error.errors = ajv.errors;
    throw error;
  }

  return merge;
}

function chooseAjvInstance(defaultInstance, ajvOpts) {
  if (!ajvOpts) {
    return defaultInstance;
  } else if (
    typeof ajvOpts === 'object' &&
    typeof ajvOpts.customOptions === 'function'
  ) {
    const ajv = ajvOpts.customOptions(getDefaultInstance());

    if (!(ajv instanceof Ajv)) {
      throw new TypeError(
        'customOptions function must return an instance of Ajv',
      );
    }

    return ajv;
  }

  return ajvOpts;
}

function getDefaultInstance() {
  return new Ajv({
    allErrors: true,
    removeAdditional: true,
    useDefaults: true,
    coerceTypes: true,
    allowUnionTypes: true,
    addUsedSchema: false,
    keywords: [separator],
  });
}

envSchema.keywords = { separator };

module.exports = envSchema;
module.exports.default = envSchema;
module.exports.envSchema = envSchema;
