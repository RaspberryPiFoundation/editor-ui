var path = require("path");

module.exports = {
  stories: ["../**/*.stories.mdx", "../**/*.stories.js"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-react-i18next",
    "storybook-addon-root-attribute/register",
    "storybook-addon-react-router-v6",
  ],
  framework: "@storybook/react",
  features: {
    previewMdx2: true,
  },
  webpackFinal: async (config, { configType }) => {
    config.output.publicPath = "/storybook/";

    // add SVG support
    const imageRule = config.module?.rules?.find((rule) => {
      const test = rule.test;

      if (!test) {
        return false;
      }

      return test.test(".svg");
    });

    imageRule.exclude = /\.svg$/;

    config.module?.rules?.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // add SCSS support for CSS Modules
    config.module.rules.push({
      test: /\.(scss)$/,
      use: [
        {
          loader: "style-loader",
        },
        {
          loader: "css-loader",
        },
        {
          loader: "postcss-loader",
          options: {
            postcssOptions: {
              plugins: function () {
                return [require("precss"), require("autoprefixer")];
              },
            },
          },
        },
        {
          loader: require.resolve("sass-loader"),
          options: {
            implementation: require("sass"),
          },
        },
      ],
    });
    // add the app to allow alias imports
    config.resolve.modules.push(path.resolve(__dirname, "../../src"));
    config.resolve.modules.push("../__webpack__");
    return config;
  },
  managerWebpack: async (config) => {
    config.output.publicPath = "/storybook/";
    return config;
  },
  // https://github.com/storybookjs/storybook/issues/7775#issuecomment-968992047
  managerHead: (head, { configType }) => {
    return `
      ${head}
      <base href="/storybook/">
    `;
  },
};
