const defaultOwnerAutoSaveHostApi = {
  hasPendingAutoSave: () => false,
  flushPendingAutoSave: () => Promise.resolve(),
  shouldFlushBeforeNavigation: () => false,
};

const defaultScratchAutoSaveHostApi = {
  hasPendingAutoSave: () => false,
  flushPendingAutoSave: () => Promise.resolve(),
  shouldFlushBeforeNavigation: () => false,
};

let ownerAutoSaveHostApi = { ...defaultOwnerAutoSaveHostApi };
let scratchAutoSaveHostApi = { ...defaultScratchAutoSaveHostApi };

export const registerOwnerAutoSaveHostApi = (api) => {
  ownerAutoSaveHostApi = { ...defaultOwnerAutoSaveHostApi, ...api };
};

export const clearOwnerAutoSaveHostApi = () => {
  ownerAutoSaveHostApi = { ...defaultOwnerAutoSaveHostApi };
};

export const registerScratchAutoSaveHostApi = (api) => {
  scratchAutoSaveHostApi = { ...defaultScratchAutoSaveHostApi, ...api };
};

export const clearScratchAutoSaveHostApi = () => {
  scratchAutoSaveHostApi = { ...defaultScratchAutoSaveHostApi };
};

export const getOwnerAutoSaveHostApi = () => ({
  hasPendingAutoSave: () =>
    ownerAutoSaveHostApi.hasPendingAutoSave() ||
    scratchAutoSaveHostApi.hasPendingAutoSave(),
  flushPendingAutoSave: async () => {
    await ownerAutoSaveHostApi.flushPendingAutoSave();
    await scratchAutoSaveHostApi.flushPendingAutoSave();
  },
  shouldFlushBeforeNavigation: () =>
    ownerAutoSaveHostApi.shouldFlushBeforeNavigation() ||
    scratchAutoSaveHostApi.shouldFlushBeforeNavigation(),
});
