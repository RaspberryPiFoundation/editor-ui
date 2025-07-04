const loadProjectPending = (state, action) => {
  state.loading = "pending";
  state.remixLoadFailed = false; // We need to reset this at the start of any project load
  state.modals = {};
  state.currentLoadingRequestId = action.meta.requestId;
  state.lastSavedTime = null;
};

const loadProjectFulfilled = (state, action) => {
  if (
    state.loading === "pending" &&
    state.currentLoadingRequestId === action.meta.requestId
  ) {
    state.project = action.payload.project;
    state.loading = "success";
    state.justLoaded = true;
    state.saving = "idle";
    state.currentLoadingRequestId = undefined;
    state.openFiles = [[]];
    const firstPanelIndex = 0;
    if (state.project.project_type === "html") {
      state.openFiles[firstPanelIndex].push("index.html");
    } else {
      state.openFiles[firstPanelIndex].push("main.py");
    }
    state.focussedFileIndices = [0];
  }
};

const loadProjectRejected = (state, action) => {
  if (
    state.loading === "pending" &&
    state.currentLoadingRequestId === action.meta.requestId
  ) {
    state.loading = "failed";
    state.saving = "idle";
    const splitErrorMessage = action.error.message.split(" ");
    const errorCode = splitErrorMessage[splitErrorMessage.length - 1];
    const accessToken = action.meta.arg?.accessToken;
    const accessDeniedCodes = ["401", "403", "500"];

    if (accessDeniedCodes.includes(errorCode) && !accessToken) {
      state.modals.accessDenied = {
        identifier: action.meta.arg.identifier,
        projectType: action.meta.arg.projectType,
      };
    }

    state.currentLoadingRequestId = undefined;
  }
};

export { loadProjectPending, loadProjectFulfilled, loadProjectRejected };
