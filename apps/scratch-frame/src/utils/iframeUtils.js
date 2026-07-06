export function allowedIframeHost(origin) {
  const allowedHosts = import.meta.env.REACT_APP_ALLOWED_IFRAME_ORIGINS
    ? import.meta.env.REACT_APP_ALLOWED_IFRAME_ORIGINS.split(",")
    : [];
  return import.meta.env.MODE === "test" || allowedHosts.includes(origin);
}
