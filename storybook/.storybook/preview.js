// solves Link/Router issues - https://stackoverflow.com/a/60583791
import React, { Suspense, useEffect } from "react";
import { addDecorator } from "@storybook/react";
import { withRootAttribute } from "storybook-addon-root-attribute";
// TODO: Fix router implementation that works on projects site
import { withRouter } from "storybook-addon-react-router-v6";

import i18n from "utils/i18n"; // importing the same i18n

import "assets/stylesheets/App.scss";
import "assets/stylesheets/index.scss";
import "assets/stylesheets/App.scss";
// .storybook/preview.jsx
import { I18nextProvider } from "react-i18next";
import "assets/stylesheets/App.scss";
// Wrap your stories in the I18nextProvider component
const withGlobals = (Story, context) => {
  const { locale, theme } = context.globals;
  // When the locale global changes
  // Set the new locale in i18n
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        <div id="app" className={theme === "dark" ? "--dark" : "--light"}>
          <Story />
        </div>
      </I18nextProvider>
    </Suspense>
  );
};

// https://storybook.js.org/addons/storybook-addon-react-router-v6
addDecorator(withRouter);
addDecorator(withRootAttribute);
addDecorator(withGlobals);

export const parameters = {
  i18n,
  locale: "en",
  locales: {
    en: { title: "English", left: "🇺🇸" },
    ["fr-FR"]: { title: "Français", left: "🇫🇷" },
    ["ja-JP"]: { title: "日本語", left: "🇯🇵" },
  },
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
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

export const globalTypes = {
  theme: {
    name: 'theme',
    description: 'Toggle between light and dark mode',
    toolbar: {
      icon: 'circlehollow',
      // Array of plain string values or MenuItem shape (see below)
      items: ['light', 'dark'],
      // Change title based on selected value
      dynamicTitle: true,
    },
  },
};
