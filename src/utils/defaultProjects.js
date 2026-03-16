import i18n from "./i18n";

const UNTITLED_PROJECT_NAME = "Untitled project";

export const defaultPythonProject = {
  project_type: "python",
  name: UNTITLED_PROJECT_NAME,
  locale: null,
  components: [{ extension: "py", name: "main", content: "", default: true }],
  image_list: [],
};

export const defaultHtmlProject = {
  project_type: "html",
  name: UNTITLED_PROJECT_NAME,
  components: [
    {
      extension: "html",
      name: "index",
      content: "",
    },
    { extension: "css", name: "style", content: "" },
  ],
};

export const DEFAULT_PROJECTS = {
  python: defaultPythonProject,
  html: defaultHtmlProject,
};

export const createDefaultPythonProject = async (locale = i18n.language) => {
  try {
    if (locale && i18n.resolvedLanguage !== locale) {
      await i18n.changeLanguage?.(locale);
    }
  } catch {
    // Fall back to the default untitled name if locale files fail.
  }

  return {
    ...defaultPythonProject,
    name: i18n.t("project.untitled", {
      lng: locale,
      defaultValue: UNTITLED_PROJECT_NAME,
    }),
  };
};

export const createDefaultHtmlProject = async (locale = i18n.language) => {
  try {
    if (locale && i18n.resolvedLanguage !== locale) {
      await i18n.changeLanguage?.(locale);
    }
  } catch {
    // Fall back to the default untitled name if locale files fail.
  }

  return {
    ...defaultHtmlProject,
    name: i18n.t("project.untitled", {
      lng: locale,
      defaultValue: UNTITLED_PROJECT_NAME,
    }),
  };
};
