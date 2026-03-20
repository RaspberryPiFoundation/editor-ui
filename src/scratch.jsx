import React from "react";
import { createRoot } from "react-dom/client";
import process from "process";
import { compose } from "redux";

import GUI, { AppStateHOC } from "@scratch/scratch-gui";
import ScratchIntegrationHOC from "./components/ScratchEditor/ScratchIntegrationHOC.jsx";
import dedupeScratchWarnings from "./utils/dedupeScratchWarnings.js";

import ScratchStyles from "./assets/stylesheets/Scratch.scss";

dedupeScratchWarnings();

const appTarget = document.getElementById("app");
document.getElementById("scratch-loading")?.remove();
GUI.setAppElement(appTarget);
const WrappedGui = compose(AppStateHOC, ScratchIntegrationHOC)(GUI);

if (process.env.NODE_ENV === "production" && typeof window === "object") {
  // Warn before navigating away
  window.onbeforeunload = () => true;
}

const searchParams = new URLSearchParams(window.location.search);
const projectId = searchParams.get("project_id");
const apiUrl = searchParams.get("api_url");

const defaultLocale = "en";
const locale = appTarget.dataset.locale || defaultLocale;

const postScratchGuiEvent = (type, payload = {}) => {
  window.top.postMessage({ type, ...payload }, "*");
};

const handleUpdateProjectId = (updatedProjectId) => {
  postScratchGuiEvent("scratch-gui-project-id-updated", {
    projectId: updatedProjectId,
  });
};

const handleRemixingStarted = () =>
  postScratchGuiEvent("scratch-gui-remixing-started");

const handleRemixingSucceeded = () =>
  postScratchGuiEvent("scratch-gui-remixing-succeeded");

const handleSavingStarted = () =>
  postScratchGuiEvent("scratch-gui-saving-started");

const handleSavingSucceeded = () =>
  postScratchGuiEvent("scratch-gui-saving-succeeded");

const handleScratchGuiAlert = (alertType) => {
  if (alertType === "savingError") {
    postScratchGuiEvent("scratch-gui-saving-failed");
  } else if (alertType === "creatingError") {
    postScratchGuiEvent("scratch-gui-remixing-failed");
  }
};

if (!projectId) {
  console.error("project_id is required but not set");
} else if (!apiUrl) {
  console.error("api_url is required but not set");
} else {
  const root = createRoot(appTarget);
  root.render(
    <>
      <style>{ScratchStyles}</style>
      <WrappedGui
        projectId={projectId}
        locale={locale}
        menuBarHidden={true}
        projectHost={`${apiUrl}/api/scratch/projects`}
        assetHost={`${apiUrl}/api/scratch/assets`}
        basePath={`${process.env.ASSETS_URL}/scratch-gui/`}
        onUpdateProjectId={handleUpdateProjectId}
        onShowCreatingRemixAlert={handleRemixingStarted}
        onShowRemixSuccessAlert={handleRemixingSucceeded}
        onShowSavingAlert={handleSavingStarted}
        onShowSaveSuccessAlert={handleSavingSucceeded}
        onShowAlert={handleScratchGuiAlert}
      />
    </>,
  );
}
