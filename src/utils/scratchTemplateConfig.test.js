const {
  getCspApiMultipleOrigins,
  getScratchTemplateParameters,
  scratchLibraryAssetUrlTemplate,
  toOrigin,
} = require("./scratchTemplateConfig.cjs");

describe("scratchTemplateConfig", () => {
  it("normalizes configured URLs to CSP origins", () => {
    expect(toOrigin("ASSETS_URL", "https://example.com/branches/main")).toBe(
      "https://example.com",
    );
  });

  it("rejects invalid absolute URLs", () => {
    expect(() => toOrigin("ASSETS_URL", "not a url")).toThrow(
      'Invalid URL in ASSETS_URL: "not a url"',
    );
  });

  it("supports comma and whitespace separated API origins", () => {
    expect(
      getCspApiMultipleOrigins(
        "https://api.example.com, https://test.example.com\nhttps://extra.example.com/path",
      ),
    ).toBe(
      "https://api.example.com https://test.example.com https://extra.example.com",
    );
  });

  it("builds Scratch HTML template parameters", () => {
    expect(
      getScratchTemplateParameters({
        assetsUrl: "https://assets.example.com/branches/main",
        cspApiMultipleOrigins: "https://api-one.example.com",
        nodeEnv: "production",
        publicUrl: "https://static.example.com/releases/v1/",
        reactAppApiEndpoint: "https://api.example.com/v1",
      }),
    ).toEqual({
      publicUrl: "https://static.example.com/releases/v1/",
      cspApiOrigin: "https://api.example.com",
      cspApiMultipleOrigins: "https://api-one.example.com",
      cspAssetOrigin: "https://assets.example.com",
      cspScratchLibraryAssetOrigin: "https://editor-assets.raspberrypi.org",
      isDev: false,
    });
  });

  it("exports the Scratch library asset template used at runtime", () => {
    expect(scratchLibraryAssetUrlTemplate).toBe(
      "https://editor-assets.raspberrypi.org/internalapi/asset/{assetPath}/get/",
    );
  });
});
