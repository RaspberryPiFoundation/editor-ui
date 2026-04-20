export const postScratchGuiEvent = (type, payload = {}) => {
  const searchParams = new URLSearchParams(window.location.search);
  const parentOriginFromQuery = searchParams.get("parent_origin");
  const allowedParentOrigin = parentOriginFromQuery || window.location.origin;

  window.parent.postMessage({ type, ...payload }, allowedParentOrigin);
};
