export function allowedIframeHost(origin) {
  const allowedHosts = process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS
    ? process.env.REACT_APP_ALLOWED_IFRAME_ORIGINS.split(",")
    : [];
  return process.env.NODE_ENV === "test" || allowedHosts.includes(origin);
}
