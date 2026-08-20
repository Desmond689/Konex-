/**
 * KONEX Webpack Configuration
 * Billion Dollar Code - Production Ready
 */
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  return config;
};