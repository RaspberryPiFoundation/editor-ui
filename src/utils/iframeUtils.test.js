import { allowedIframeHost } from "./iframeUtils";

describe("allowedIframeHost", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, NODE_ENV: "development" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("allows same-origin messages without env configuration", () => {
    process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS = "";

    expect(allowedIframeHost(window.location.origin)).toBe(true);
  });

  it("allows configured iframe origins", () => {
    process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS = "https://editor.example.com";

    expect(allowedIframeHost("https://editor.example.com")).toBe(true);
  });

  it("rejects unrelated origins", () => {
    process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS = "https://editor.example.com";

    expect(allowedIframeHost("https://other.example.com")).toBe(false);
  });
});
