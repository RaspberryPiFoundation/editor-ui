const defaultOwnerAutoSaveHostApi = {
  hasPendingAutoSave: () => false,
  flushPendingAutoSave: () => Promise.resolve(),
  shouldFlushBeforeNavigation: () => false,
};

let ownerAutoSaveHostApi = { ...defaultOwnerAutoSaveHostApi };

export const registerOwnerAutoSaveHostApi = (api) => {
  ownerAutoSaveHostApi = { ...defaultOwnerAutoSaveHostApi, ...api };
};

export const clearOwnerAutoSaveHostApi = () => {
  ownerAutoSaveHostApi = { ...defaultOwnerAutoSaveHostApi };
};

export const getOwnerAutoSaveHostApi = () => ownerAutoSaveHostApi;
