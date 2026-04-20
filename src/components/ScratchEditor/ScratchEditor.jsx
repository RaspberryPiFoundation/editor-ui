import scratchProjectSave from "../../utils/scratchProjectSave.js";
import { useCallback } from "react";

import WrapperdScratchGui from "./WrappedScratchGui.jsx";
import { postScratchGuiEvent } from "./events.js";

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

let scratchFetchApi = null;

const ScratchEditor = ({ projectId, locale, apiUrl, accessToken }) => {
  const handleUpdateProjectData = useCallback(
    async (currentProjectId, vmState, params) => {
      return scratchProjectSave({
        scratchFetchApi,
        apiUrl,
        currentProjectId,
        vmState,
        params,
      });
    },
    [apiUrl],
  );

  return (
    <WrapperdScratchGui
      projectId={projectId}
      locale={locale}
      menuBarHidden={true}
      projectHost={`${apiUrl}/api/scratch/projects`}
      assetHost={`${apiUrl}/api/scratch/assets`}
      basePath={`${process.env.ASSETS_URL}/scratch-gui/`}
      onStorageInit={(storage) => {
        scratchFetchApi = storage.scratchFetch;
        if (accessToken) {
          scratchFetchApi.setMetadata("Authorization", accessToken);
        }
      }}
      onUpdateProjectData={handleUpdateProjectData}
      onUpdateProjectId={handleUpdateProjectId}
      onShowCreatingRemixAlert={handleRemixingStarted}
      onShowRemixSuccessAlert={handleRemixingSucceeded}
      onShowSavingAlert={handleSavingStarted}
      onShowSaveSuccessAlert={handleSavingSucceeded}
      onShowAlert={handleScratchGuiAlert}
    />
  );
};

export default ScratchEditor;
