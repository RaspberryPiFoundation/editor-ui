const HTTP_CONTENT_TOO_LARGE = 413;
const HTTP_UNPROCESSABLE_CONTENT = 422;

export const ASSET_TOO_LARGE = "asset_too_large";
export const PROJECT_TOO_LARGE = "project_too_large";

export const getErrorType = (error) => {
  if (error === HTTP_CONTENT_TOO_LARGE) {
    return ASSET_TOO_LARGE;
  } else if (error === HTTP_UNPROCESSABLE_CONTENT) {
    return PROJECT_TOO_LARGE;
  }
  return null;
};

export const createAssetUploadErrorTracker = () => {
  let reason = null;

  return {
    record: (error) => {
      if (!reason) {
        reason = getErrorType(error);
      }
    },
    consume: () => {
      const recorded = reason;
      reason = null;
      return recorded;
    },
    clear: () => {
      reason = null;
    },
  };
};
