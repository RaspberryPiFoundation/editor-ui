// solves Link/Router issues - https://stackoverflow.com/a/60583791
import React, { Suspense, useEffect } from "react";
import { addDecorator } from "@storybook/react";
import { withRootAttribute } from "storybook-addon-root-attribute";
// TODO: Fix router implementation that works on projects site
import { withRouter } from "storybook-addon-react-router-v6";

import i18n from "utils/i18n"; // importing the same i18n

import "assets/stylesheets/index.scss";
import "assets/stylesheets/App.scss";

// .storybook/preview.jsx
import { I18nextProvider } from "react-i18next";

// Wrap your stories in the I18nextProvider component
const withI18next = (Story, context) => {
  const { locale } = context.globals;

  const theme = "dark";
  // When the locale global changes
  // Set the new locale in i18n
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        <div id="app" className={`--${theme}`}>
          <Story />
        </div>
      </I18nextProvider>
    </Suspense>
  );
};

// https://storybook.js.org/addons/storybook-addon-react-router-v6
addDecorator(withI18next);
addDecorator(withRouter);
addDecorator(withRootAttribute);

export const parameters = {
  i18n,
  locale: "en",
  locales: {
    en: { title: "English", left: "🇺🇸" },
    ["fr-FR"]: { title: "Français", left: "🇫🇷" },
    ["ja-JP"]: { title: "日本語", left: "🇯🇵" },
  },
  theme: {
    light: { title: "light" },
    dark: { title: "dark" },
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
