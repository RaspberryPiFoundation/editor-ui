const defaultAutoSaveHostApi = {
  hasPendingAutoSave: () => false,
  flushPendingAutoSave: () => Promise.resolve(),
  shouldFlushBeforeNavigation: () => false,
};

const defaultScratchAutoSaveHostApi = {
  hasPendingAutoSave: () => false,
  flushPendingAutoSave: () => Promise.resolve(),
  shouldFlushBeforeNavigation: () => false,
};

let projectAutoSaveHostApi = { ...defaultAutoSaveHostApi };
let scratchAutoSaveHostApi = { ...defaultScratchAutoSaveHostApi };

export const registerAutoSaveHostApi = (api) => {
  projectAutoSaveHostApi = { ...defaultAutoSaveHostApi, ...api };
};

export const clearAutoSaveHostApi = () => {
  projectAutoSaveHostApi = { ...defaultAutoSaveHostApi };
};

export const registerScratchAutoSaveHostApi = (api) => {
  scratchAutoSaveHostApi = { ...defaultScratchAutoSaveHostApi, ...api };
};

export const clearScratchAutoSaveHostApi = () => {
  scratchAutoSaveHostApi = { ...defaultScratchAutoSaveHostApi };
};

export const getAutoSaveHostApi = () => ({
  hasPendingAutoSave: () =>
    projectAutoSaveHostApi.hasPendingAutoSave() ||
    scratchAutoSaveHostApi.hasPendingAutoSave(),
  flushPendingAutoSave: async () => {
    await projectAutoSaveHostApi.flushPendingAutoSave();
    await scratchAutoSaveHostApi.flushPendingAutoSave();
  },
  shouldFlushBeforeNavigation: () =>
    projectAutoSaveHostApi.shouldFlushBeforeNavigation() ||
    scratchAutoSaveHostApi.shouldFlushBeforeNavigation(),
});
