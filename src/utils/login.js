import userManager from "./userManager";

export const login = ({
  project,
  location,
  triggerSave,
  accessDeniedData,
  loginRedirect,
} = {}) => {
  window.plausible("Login button");
  if (accessDeniedData) {
    localStorage.setItem(
      "location",
      `/projects/${accessDeniedData.identifier}`,
    );
  } else {
    localStorage.setItem("location", loginRedirect || location.pathname);
    if (project) {
      localStorage.setItem(
        project.identifier || "project",
        JSON.stringify(project),
      );
    }
  }
  if (triggerSave) {
    localStorage.setItem("awaitingSave", "true");
  }
  userManager.signinRedirect();
};
