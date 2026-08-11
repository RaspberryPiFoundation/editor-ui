const { JEST_ONLY_TEST_FILES } = require("./test-runner-migration.js");

module.exports = {
  roots: ["<rootDir>/src"],
  collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}", "!src/**/*.d.ts"],
  setupFiles: ["react-app-polyfill/jsdom"],
  setupFilesAfterEnv: ["<rootDir>/src/utils/setupTests.js"],
  testMatch: JEST_ONLY_TEST_FILES.map((file) => `<rootDir>/${file}`),
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    resources: "usable",
  },
  testRunner: "jest-circus/runner",
  transform: {
    "^.+\\.(js|jsx|mjs|cjs|ts|tsx)$": "<rootDir>/config/jest/babelTransform.js",
    ".+\\.css$": "<rootDir>/node_modules/jest-css-modules-transform",
    "^.+\\.scss$": "<rootDir>/node_modules/jest-scss-transform",
    "^.+\\.svg$": "jest-transformer-svg",
    "^(?!.*\\.(js|jsx|mjs|cjs|ts|tsx|css|scss|svg|json)$)":
      "<rootDir>/node_modules/jest-transform-stub",
  },
  transformIgnorePatterns: [
    // Ignore everything under node_modules except the packages listed below,
    // which Jest has to transform because they are "type": "module" with no
    // CommonJS entry point: rpf-markdown-core's CJS build requires marked and
    // scratchblocks/index.js, so their raw `export` syntax would otherwise
    // reach the CJS loader. A nested copy (rpf-markdown-core/node_modules/
    // scratchblocks) is also exempted.
    "^(?!.*[/\\\\]node_modules[/\\\\](?:three|marked|scratchblocks)[/\\\\]).*[/\\\\]node_modules[/\\\\].+\\.(js|jsx|mjs|cjs|ts|tsx)$",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  modulePaths: [],
  moduleNameMapper: {
    "^react-native$": "react-native-web",
    "^(.+\\.scss)\\?inline$": "$1",
    "^(.+\\.css)\\?inline$": "$1",
    "^(.+\\.md)\\?raw$": "$1",
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",
  },
  moduleFileExtensions: [
    "web.js",
    "js",
    "web.ts",
    "ts",
    "web.tsx",
    "tsx",
    "json",
    "web.jsx",
    "jsx",
    "node",
  ],
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  resetMocks: true,
};
