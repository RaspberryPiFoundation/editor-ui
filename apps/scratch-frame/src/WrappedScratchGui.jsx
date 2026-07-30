import ScratchIntegrationHOC from "./ScratchIntegrationHOC.jsx";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { combineReducers, createStore } from "redux";

const scratchGui = window.GUI;
const ScratchComponent = scratchGui.default;

const appTarget = document.getElementById("app");
scratchGui.setAppElement(appTarget);
const ScratchGuiWithIntegration = ScratchIntegrationHOC(ScratchComponent);

export const createScratchStore = (locale) =>
  createStore(
    combineReducers(scratchGui.guiReducers),
    {
      locales: scratchGui.initLocale(scratchGui.localesInitialState, locale),
      scratchGui: scratchGui.buildInitialState(scratchGui.legacyConfig),
    },
    scratchGui.guiMiddleware,
  );

const WrappedScratchGui = ({ locale, ...componentProps }) => {
  const [store] = useState(() => createScratchStore(locale));

  return (
    <Provider store={store}>
      <ScratchGuiWithIntegration {...componentProps} />
    </Provider>
  );
};

WrappedScratchGui.propTypes = {
  locale: PropTypes.string,
};

export default WrappedScratchGui;
