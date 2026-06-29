const trimLeadingSlash = (value) => value.replace(/^\/+/, "");

export const getRuntimeEnv = (name, fallback = "") => {
  const env = typeof process === "undefined" ? {} : process.env || {};
  const value = env[name];

  return value === undefined ? fallback : value;
};

export const getNodeEnv = () => getRuntimeEnv("NODE_ENV", "development");

export const isDevelopment = () => getNodeEnv() === "development";

export const isProduction = () => getNodeEnv() === "production";

export const isTest = () => getNodeEnv() === "test";

export const getPublicUrl = () => getRuntimeEnv("PUBLIC_URL", "");

export const getAssetsUrl = () => getRuntimeEnv("ASSETS_URL", getPublicUrl());

export const getHtmlRendererUrl = () =>
  getRuntimeEnv("HTML_RENDERER_URL", getPublicUrl());

export const runtimeUrl = (baseUrl, path) => {
  const normalizedPath = trimLeadingSlash(path);
  if (!baseUrl) return `/${normalizedPath}`;
  if (baseUrl.endsWith("/")) return `${baseUrl}${normalizedPath}`;
  return `${baseUrl}/${normalizedPath}`;
};

export const publicPath = (path) => runtimeUrl(getPublicUrl(), path);

export const assetPath = (path) => runtimeUrl(getAssetsUrl(), path);

export const htmlRendererPath = (path) =>
  runtimeUrl(getHtmlRendererUrl(), path);
