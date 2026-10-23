export const ASSET_TOO_LARGE = "assetTooLarge";

const HTTP_CONTENT_TOO_LARGE = 413;

export const isAssetTooLargeError = (error) =>
  error === HTTP_CONTENT_TOO_LARGE || error?.status === HTTP_CONTENT_TOO_LARGE;

export const createAssetUploadErrorTracker = () => {
  let reason = null;

  return {
    record: (error) => {
      if (!reason && isAssetTooLargeError(error)) {
        reason = ASSET_TOO_LARGE;
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
