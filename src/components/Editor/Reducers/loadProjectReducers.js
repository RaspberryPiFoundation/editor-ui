const loadProjectPending = (state, action) => {
  state.loading = "pending";
  state.accessDeniedNoAuthModalShowing = false;
  state.modals = {};
  state.currentLoadingRequestId = action.meta.requestId;
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
    if (state.openFiles.flat().length === 0) {
      const firstPanelIndex = 0;
      if (state.project.project_type === "html") {
        state.openFiles[firstPanelIndex].push("index.html");
      } else {
        state.openFiles[firstPanelIndex].push("main.py");
      }
    }
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
    const accessDeniedCodes = ["401", "403", "500"];

    if (errorCode === "404") {
      state.notFoundModalShowing = true;
    } else if (
      accessDeniedCodes.includes(errorCode) &&
      action.meta.arg.accessToken
    ) {
      state.accessDeniedWithAuthModalShowing = true;
    } else if (
      accessDeniedCodes.includes(errorCode) &&
      !action.meta.arg.accessToken
    ) {
      state.accessDeniedNoAuthModalShowing = true;
      state.modals.accessDenied = {
        identifier: action.meta.arg.identifier,
        projectType: action.meta.arg.projectType,
      };
    }

    state.currentLoadingRequestId = undefined;
  }
};

export { loadProjectPending, loadProjectFulfilled, loadProjectRejected };
