import {
  assetPath,
  getAssetsUrl,
  getHtmlRendererUrl,
  getPublicOriginUrl,
  getRuntimeEnv,
  htmlRendererPath,
  publicOriginPath,
  publicPath,
} from "./runtimeConfig";

describe("runtimeConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("reads environment values dynamically", () => {
    process.env.REACT_APP_API_ENDPOINT = "https://api.example.com";

    expect(getRuntimeEnv("REACT_APP_API_ENDPOINT")).toBe(
      "https://api.example.com",
    );
  });

  it("falls back to PUBLIC_URL for asset and HTML renderer origins", () => {
    process.env.PUBLIC_URL = "https://static.example.com/branch";
    delete process.env.ASSETS_URL;
    delete process.env.HTML_RENDERER_URL;

    expect(getAssetsUrl()).toBe("https://static.example.com/branch");
    expect(getHtmlRendererUrl()).toBe("https://static.example.com/branch");
  });

  it("falls back to the browser origin for empty asset origins", () => {
    process.env.PUBLIC_URL = "";
    process.env.ASSETS_URL = "";
    process.env.HTML_RENDERER_URL = "";

    expect(getAssetsUrl()).toBe(window.location.origin);
    expect(getHtmlRendererUrl()).toBe(window.location.origin);
  });

  it("joins paths without duplicating slashes", () => {
    process.env.PUBLIC_URL = "https://static.example.com/branch/";
    process.env.ASSETS_URL = "https://assets.example.com/branch";
    process.env.HTML_RENDERER_URL = "https://renderer.example.com/branch";

    expect(publicPath("/translations/en.json")).toBe(
      "https://static.example.com/branch/translations/en.json",
    );
    expect(assetPath("scratch.html")).toBe(
      "https://assets.example.com/branch/scratch.html",
    );
    expect(htmlRendererPath("/html-renderer.html")).toBe(
      "https://renderer.example.com/branch/html-renderer.html",
    );
  });

  it("keeps root-relative paths when PUBLIC_URL is blank", () => {
    process.env.PUBLIC_URL = "";

    expect(publicPath("translations/en.json")).toBe("/translations/en.json");
  });

  it("can force browser-origin public paths for blob workers", () => {
    process.env.PUBLIC_URL = "";

    expect(getPublicOriginUrl()).toBe(window.location.origin);
    expect(publicOriginPath("PyodideWorker.js")).toBe(
      `${window.location.origin}/PyodideWorker.js`,
    );
  });
});
