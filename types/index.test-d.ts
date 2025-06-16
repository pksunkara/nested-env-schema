import { expectError, expectType } from 'tsd';
import envSchema, {
  EnvSchemaData,
  EnvSchemaOpt,
  keywords,
  envSchema as envSchemaNamed,
  default as envSchemaDefault,
} from '..';
import Ajv, { KeywordDefinition, JSONSchemaType } from 'ajv';
import { z } from 'zod/v4';

interface EnvData {
  PORT: number;
}

const schemaWithType: JSONSchemaType<EnvData> = {
  type: 'object',
  required: ['PORT'],
  properties: {
    PORT: {
      type: 'number',
      default: 3000,
    },
  },
};

const schemaZod = z.object({
  PORT: z.number().default(3000),
});

type SchemaZod = z.infer<typeof schemaZod>;

const data = {
  foo: 'bar',
};

expectType<EnvSchemaData>(envSchema());
expectType<EnvSchemaData>(envSchemaNamed());
expectType<EnvSchemaData>(envSchemaDefault());

const emptyOpt: EnvSchemaOpt = {};
expectType<EnvSchemaOpt>(emptyOpt);

const optWithSchemaZod: EnvSchemaOpt = {
  schema: z.toJSONSchema(schemaZod),
};
expectType<EnvSchemaOpt>(optWithSchemaZod);

const optWithSchemaWithType: EnvSchemaOpt<EnvData> = {
  schema: schemaWithType,
};
expectType<EnvSchemaOpt<EnvData>>(optWithSchemaWithType);

const optWithData: EnvSchemaOpt = {
  data,
};
expectType<EnvSchemaOpt>(optWithData);

expectError<EnvSchemaOpt>({
  data: [], // min 1 item
});

const optWithArrayData: EnvSchemaOpt = {
  data: [{}],
};
expectType<EnvSchemaOpt>(optWithArrayData);

const optWithMultipleItemArrayData: EnvSchemaOpt = {
  data: [{}, {}],
};
expectType<EnvSchemaOpt>(optWithMultipleItemArrayData);

const optWithDotEnvBoolean: EnvSchemaOpt = {
  dotenv: true,
};
expectType<EnvSchemaOpt>(optWithDotEnvBoolean);

const optWithDotEnvOpt: EnvSchemaOpt = {
  dotenv: {},
};
expectType<EnvSchemaOpt>(optWithDotEnvOpt);

const optWithAjvInstance: EnvSchemaOpt = {
  ajv: new Ajv(),
};
expectType<EnvSchemaOpt>(optWithAjvInstance);
expectType<KeywordDefinition>(envSchema.keywords.separator);

const optWithAjvCustomOptions: EnvSchemaOpt = {
  ajv: {
    customOptions(ajvInstance: Ajv): Ajv {
      return new Ajv();
    },
  },
};
expectType<EnvSchemaOpt>(optWithAjvCustomOptions);
expectError<EnvSchemaOpt>({
  ajv: {
    customOptions(ajvInstance: Ajv) {},
  },
});

const envSchemaWithType = envSchema({ schema: schemaWithType });
expectType<EnvData>(envSchemaWithType);

const envSchemaZod = envSchema<SchemaZod>({
  schema: z.toJSONSchema(schemaZod),
});
expectType<SchemaZod>(envSchemaZod);

expectType<KeywordDefinition>(keywords.separator);
expectType<KeywordDefinition>(envSchema.keywords.separator);
