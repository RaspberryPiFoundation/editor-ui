export const allowedParentOrigin = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const parentOriginFromQuery = searchParams.get("parent_origin");
  return parentOriginFromQuery || window.location.origin;
};

export const postScratchGuiEvent = (type, payload = {}) => {
  window.parent.postMessage({ type, ...payload }, allowedParentOrigin());
};
