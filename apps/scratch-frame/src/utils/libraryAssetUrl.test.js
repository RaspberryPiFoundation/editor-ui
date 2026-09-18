import {
  SCRATCH_LIBRARY_ASSET_HOST,
  buildLibraryAssetUrl,
} from "./libraryAssetUrl.js";

describe("buildLibraryAssetUrl", () => {
  test("builds an asset service URL on our own host", () => {
    expect(buildLibraryAssetUrl("abc123", "svg")).toBe(
      `${SCRATCH_LIBRARY_ASSET_HOST}/internalapi/asset/abc123.svg/get/`,
    );
  });

  test("does not fall back to the Scratch CDN", () => {
    expect(buildLibraryAssetUrl("abc123", "png")).not.toContain(
      "cdn.assets.scratch.mit.edu",
    );
  });
});
