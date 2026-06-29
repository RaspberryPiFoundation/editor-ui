/* global __RUNTIME_ENV__ */

const trimLeadingSlash = (value) => value.replace(/^\/+/, "");

const getBundledEnv = () =>
  typeof __RUNTIME_ENV__ === "undefined" ? {} : __RUNTIME_ENV__;

export const getRuntimeEnv = (name, fallback = "") => {
  const env =
    typeof process === "undefined" ? getBundledEnv() : process.env || {};
  const value = env[name];

  return value === undefined ? fallback : value;
};

export const getNodeEnv = () => getRuntimeEnv("NODE_ENV", "development");

export const isDevelopment = () => getNodeEnv() === "development";

export const isProduction = () => getNodeEnv() === "production";

export const isTest = () => getNodeEnv() === "test";

export const getPublicUrl = () => getRuntimeEnv("PUBLIC_URL", "");

const getBrowserOrigin = () =>
  typeof window === "undefined" ? "" : window.location.origin;

export const getPublicOriginUrl = () => getPublicUrl() || getBrowserOrigin();

export const getAssetsUrl = () =>
  getRuntimeEnv("ASSETS_URL") || getPublicUrl() || getBrowserOrigin();

export const getHtmlRendererUrl = () =>
  getRuntimeEnv("HTML_RENDERER_URL") || getPublicUrl() || getBrowserOrigin();

export const runtimeUrl = (baseUrl, path) => {
  const normalizedPath = trimLeadingSlash(path);
  if (!baseUrl) return `/${normalizedPath}`;
  if (baseUrl.endsWith("/")) return `${baseUrl}${normalizedPath}`;
  return `${baseUrl}/${normalizedPath}`;
};

export const publicPath = (path) => runtimeUrl(getPublicUrl(), path);

export const publicOriginPath = (path) =>
  runtimeUrl(getPublicOriginUrl(), path);

export const assetPath = (path) => runtimeUrl(getAssetsUrl(), path);

export const htmlRendererPath = (path) =>
  runtimeUrl(getHtmlRendererUrl(), path);
