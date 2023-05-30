import userManager from "./userManager";

export const login = ({
  project,
  location,
  triggerSave,
  accessDeniedData,
} = {}) => {
  window.plausible("Login button");
  if (accessDeniedData) {
    localStorage.setItem(
      "location",
      `/projects/${accessDeniedData.identifier}`,
    );
  } else {
    localStorage.setItem("location", location.pathname);
    localStorage.setItem(
      project.identifier || "project",
      JSON.stringify(project),
    );
  }
  if (triggerSave) {
    localStorage.setItem("awaitingSave", "true");
  }
  userManager.signinRedirect();
};
