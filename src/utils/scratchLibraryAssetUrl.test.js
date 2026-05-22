import { resolveScratchLibraryAssetUrlTemplate } from "./scratchLibraryAssetUrl.js";

describe("resolveScratchLibraryAssetUrlTemplate", () => {
  test("returns explicit URL template when set", () => {
    expect(
      resolveScratchLibraryAssetUrlTemplate({
        urlTemplateEnv:
          "https://editor-assets.raspberrypi.org/files/{assetPath}",
      }),
    ).toBe("https://editor-assets.raspberrypi.org/files/{assetPath}");
  });

  test("returns undefined when env is unset", () => {
    expect(
      resolveScratchLibraryAssetUrlTemplate({
        urlTemplateEnv: "",
      }),
    ).toBeUndefined();
  });
});
