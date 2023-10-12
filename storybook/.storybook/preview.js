// solves Link/Router issues - https://stackoverflow.com/a/60583791
import React from "react";
import { addDecorator } from "@storybook/react";
import { withRootAttribute } from "storybook-addon-root-attribute";
// TODO: Fix router implementation that works on projects site
// import { withRouter } from "storybook-addon-react-router-v6";

import i18n from "utils/i18n"; // importing the same i18n

import "assets/stylesheets/index.scss";

// https://storybook.js.org/addons/storybook-addon-react-router-v6
// addDecorator(withRouter);
addDecorator(withRootAttribute);

export const parameters = {
  i18n,
  locale: "en",
  locales: {
    en: { title: "English", left: "🇺🇸" },
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  rootAttribute: {
    root: "body",
    attribute: "data-sauce-theme",
    defaultState: {
      name: "Default",
      value: "editor-ui",
    },
    states: [],
  },
};
