import React from "react";
import { createRoot } from "react-dom/client";
import { compose } from "redux";
import process from "process";

import GUI, { AppStateHOC } from "@scratch/scratch-gui";
import ScratchIntegrationHOC from "./components/ScratchEditor/ScratchIntegrationHOC.jsx";

import ScratchStyles from "./assets/stylesheets/Scratch.scss";

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

const handleUpdateProjectId = (projectId) => {
  window.top.postMessage(
    { type: "scratch-gui-project-id-updated", projectId: projectId },
    "*",
  );
};

const handleRemixingStarted = () => {
  window.top.postMessage({ type: "scratch-gui-remixing-started" }, "*");
};

const handleRemixingSucceeded = () => {
  window.top.postMessage({ type: "scratch-gui-remixing-succeeded" }, "*");
};

const handleSavingStarted = () => {
  window.top.postMessage({ type: "scratch-gui-saving-started" }, "*");
};

const handleSavingSucceeded = () => {
  window.top.postMessage({ type: "scratch-gui-saving-succeeded" }, "*");
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
      />
    </>,
  );
}
