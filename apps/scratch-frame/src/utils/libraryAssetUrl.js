export const SCRATCH_LIBRARY_ASSET_HOST =
  "https://editor-assets.raspberrypi.org";

/**
 * Builds the URL a library thumbnail is fetched from, in the shape Scratch's
 * asset service uses. Supplied to Scratch GUI as GUIStorage.getLibraryAssetUrl,
 * which it calls when rendering sprite, costume and backdrop library items.
 *
 * @param {string} assetId - the md5 of the asset.
 * @param {string} dataFormat - the asset's file extension.
 * @returns {string} the URL to fetch the asset from.
 */
export const buildLibraryAssetUrl = (assetId, dataFormat) =>
  `${SCRATCH_LIBRARY_ASSET_HOST}/internalapi/asset/${assetId}.${dataFormat}/get/`;
