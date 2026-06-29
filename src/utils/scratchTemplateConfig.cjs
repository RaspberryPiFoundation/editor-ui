const scratchLibraryAssetUrlTemplate =
  "https://editor-assets.raspberrypi.org/internalapi/asset/{assetPath}/get/";

const toOrigin = (envVarName, value) => {
  const normalizedValue = String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");

  if (!normalizedValue) return "";

  try {
    return new URL(normalizedValue).origin;
  } catch (_) {
    throw new Error(
      `Invalid URL in ${envVarName}: "${value}". ` +
        `Expected an absolute URL, for example "https://example.com".`,
    );
  }
};

const getCspApiMultipleOrigins = (value) =>
  String(value || "")
    .split(/[\s,]+/)
    .map((originValue, index) =>
      toOrigin(`CSP_API_MULTIPLE_ORIGINS[${index}]`, originValue),
    )
    .filter(Boolean)
    .join(" ");

const getScratchTemplateParameters = ({
  assetsUrl,
  cspApiMultipleOrigins,
  nodeEnv,
  publicUrl,
  reactAppApiEndpoint,
}) => ({
  publicUrl,
  cspApiOrigin: toOrigin("REACT_APP_API_ENDPOINT", reactAppApiEndpoint),
  cspApiMultipleOrigins: getCspApiMultipleOrigins(cspApiMultipleOrigins),
  cspAssetOrigin: toOrigin("ASSETS_URL", assetsUrl),
  cspScratchLibraryAssetOrigin: toOrigin(
    "SCRATCH_LIBRARY_ASSET_URL_TEMPLATE",
    scratchLibraryAssetUrlTemplate,
  ),
  isDev: nodeEnv !== "production",
});

module.exports = {
  getCspApiMultipleOrigins,
  getScratchTemplateParameters,
  scratchLibraryAssetUrlTemplate,
  toOrigin,
};
