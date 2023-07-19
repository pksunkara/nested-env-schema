module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2021,
  },
  extends: ['plugin:prettier/recommended'],
  rules: {},
  env: {
    node: true,
  },
  ignorePatterns: ['!.prettierrc.js'],
};
