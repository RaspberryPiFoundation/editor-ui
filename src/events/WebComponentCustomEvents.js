export const WebComponentEvents = {
  LogIn: "editor-logIn",
  SignUp: "editor-signUp",
};

const webComponentCustomEvent = (type, detail) =>
  new CustomEvent(type, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail: detail,
  });

export const codeChangedEvent = webComponentCustomEvent("editor-codeChanged");

export const runCompletedEvent = (detail) =>
  webComponentCustomEvent("editor-runCompleted", detail);

export const runStartedEvent = webComponentCustomEvent("editor-runStarted");

export const stepChangedEvent = (detail) =>
  webComponentCustomEvent("editor-stepChanged", detail);

export const logInEvent = (detail) =>
  webComponentCustomEvent(WebComponentEvents.LogIn, detail);

export const signUpEvent = (detail) =>
  webComponentCustomEvent(WebComponentEvents.SignUp, detail);
