import ScratchIntegrationHOC from "./ScratchIntegrationHOC.jsx";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { combineReducers, createStore } from "redux";
import { buildLibraryAssetUrl } from "./utils/libraryAssetUrl.js";

const scratchGui = window.GUI;
const ScratchComponent = scratchGui.default;

const appTarget = document.getElementById("app");
scratchGui.setAppElement(appTarget);
const ScratchGuiWithIntegration = ScratchIntegrationHOC(ScratchComponent);

scratchGui.legacyConfig.storage.getLibraryAssetUrl = buildLibraryAssetUrl;

export const createScratchStore = (locale) => {
  const initialState = scratchGui.buildInitialState(scratchGui.legacyConfig);

  return createStore(
    combineReducers(scratchGui.guiReducers),
    {
      locales: scratchGui.initLocale(scratchGui.localesInitialState, locale),
      scratchGui: {
        ...initialState,
        settings: {
          ...initialState.settings,
          colorMode: "high-contrast",
        },
      },
    },
    scratchGui.guiMiddleware,
  );
};

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
