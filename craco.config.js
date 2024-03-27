module.exports = {
  webpack: {
    configure: (config) => {
      // Ensure a fallback is in place
      config.resolve.fallback = config.resolve.fallback || {};

      // Add the fallbacks for 'querystring' and 'url'
      config.resolve.fallback["querystring"] =
        require.resolve("querystring-es3");
      config.resolve.fallback["url"] = require.resolve("url/");

      return config;
    },
  },
  jest: {
    babel: {
      transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
        "^.+\\.svg$": "jest-transformer-svg",
      },
    },
    configure: {
      setupFilesAfterEnv: ["./config/jest/setupTests.js"],
      collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts"],
      moduleNameMapper: {
        "^axios$": "axios/dist/node/axios.cjs", // must use the CommonJS build
      },
    },
  },
};
