import React from "react";
import { createRoot } from "react-dom/client";
import { compose } from "redux";
import process from "process";

import GUI, { AppStateHOC } from "@scratch/scratch-gui";
import ScratchIntegrationHOC from "./components/ScratchEditor/ScratchIntegrationHOC.jsx";

import ScratchStyles from "./assets/stylesheets/Scratch.scss";

const appTarget = document.getElementById("app");
GUI.setAppElement(appTarget);

const WrappedGui = compose(AppStateHOC, ScratchIntegrationHOC)(GUI);

if (process.env.NODE_ENV === "production" && typeof window === "object") {
  // Warn before navigating away
  window.onbeforeunload = () => true;
}

const defaultProjectId = 0;
const projectId = appTarget.dataset.projectId || defaultProjectId;

const defaultLocale = "en";
const locale = appTarget.dataset.locale || defaultLocale;

const handleUpdateProjectId = (projectId) => {
  window.top.postMessage(
    { type: "scratch-gui-project-id-updated", projectId: projectId },
    window.location.origin,
  );
};

const handleRemixingStarted = () => {
  window.top.postMessage(
    { type: "scratch-gui-remixing-started" },
    window.location.origin,
  );
};

const handleRemixingSucceeded = () => {
  window.top.postMessage(
    { type: "scratch-gui-remixing-succeeded" },
    window.location.origin,
  );
};

const handleSavingStarted = () => {
  window.top.postMessage(
    { type: "scratch-gui-saving-started" },
    window.location.origin,
  );
};

const handleSavingSucceeded = () => {
  window.top.postMessage(
    { type: "scratch-gui-saving-succeeded" },
    window.location.origin,
  );
};

const root = createRoot(appTarget);
root.render(
  <>
    <style>{ScratchStyles}</style>
    <WrappedGui
      projectId={projectId}
      locale={locale}
      menuBarHidden={true}
      projectHost={"/api/projects"}
      assetHost={`${process.env.ASSETS_URL}/api/assets`}
      basePath={"/scratch-gui/"}
      onUpdateProjectId={handleUpdateProjectId}
      onShowCreatingRemixAlert={handleRemixingStarted}
      onShowRemixSuccessAlert={handleRemixingSucceeded}
      onShowSavingAlert={handleSavingStarted}
      onShowSaveSuccessAlert={handleSavingSucceeded}
    />
  </>,
);
