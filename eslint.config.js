const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  { files: ['scripts/**/*.cjs'], languageOptions: { globals: { __dirname: 'readonly', Buffer: 'readonly' } } },
  { ignores: ['dist/**', 'node_modules/**'] },
]);
