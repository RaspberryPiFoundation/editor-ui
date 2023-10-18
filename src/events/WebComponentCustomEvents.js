const webComponentCustomEvent = (type, detail) =>
  new CustomEvent(type, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: detail,
  });

export const codeChangedEvent = webComponentCustomEvent("codeChanged");

export const runCompletedEvent = (detail) =>
  webComponentCustomEvent("runCompleted", detail);

export const runStartedEvent = webComponentCustomEvent("runStarted");

export const stepChangedEvent = (detail) =>
  webComponentCustomEvent("stepChanged", detail);
