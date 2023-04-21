var path = require("path");

module.exports = {
  stories: ["../**/*.stories.mdx", "../**/*.stories.js"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-react-i18next",
    "storybook-addon-root-attribute/register",
  ],
  framework: "@storybook/react",
  features: {
    previewMdx2: true,
  },
  webpackFinal: async (config, { configType }) => {
    config.output.publicPath = "/design-system/";
    // add SCSS support for CSS Modules
    config.module.rules.push({
      test: /\.scss$/,
      use: ["style-loader", "css-loader?modules&importLoaders", "sass-loader"],
      include: path.resolve(__dirname, "../../"),
    });
    // add the app to allow alias imports
    config.resolve.modules.push(path.resolve(__dirname, "../../src"));
    return config;
  },
  managerWebpack: async (config) => {
    config.output.publicPath = "/design-system/";
    return config;
  },
  // https://github.com/storybookjs/storybook/issues/7775#issuecomment-968992047
  managerHead: (head, { configType }) => {
    return `
      ${head}
      <base href="/design-system/">
    `;
  },
};
