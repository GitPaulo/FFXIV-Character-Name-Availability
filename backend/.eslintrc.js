module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script',
  },
  extends: ['eslint:recommended'],
  rules: {},
  overrides: [
    {
      files: ['**/*.spec.js', '**/__tests__/**/*.js'],
      env: {
        jest: true,
      },
    },
  ],
};
