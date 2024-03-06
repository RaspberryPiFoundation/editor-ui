module.exports = function override(config, env) {
  // Ensure a fallback is in place
  config.resolve.fallback = config.resolve.fallback || {};

  // Add the fallbacks for 'querystring' and 'url'
  config.resolve.fallback["querystring"] = require.resolve("querystring-es3");
  config.resolve.fallback["url"] = require.resolve("url/");

  return config;
};
