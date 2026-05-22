/**
 * Scratch library thumbnail URL template from build-time env.
 * Unset → undefined (scratch-gui uses MIT CDN default).
 *
 * Placeholder: {assetPath} (e.g. cd21514d0531fdffb22204e0ec5ed84a.svg)
 */
export const resolveScratchLibraryAssetUrlTemplate = ({
  urlTemplateEnv = process.env.REACT_APP_SCRATCH_LIBRARY_ASSET_URL_TEMPLATE,
} = {}) => String(urlTemplateEnv || "").trim() || undefined;
