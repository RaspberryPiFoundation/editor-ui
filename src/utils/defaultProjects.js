import i18n from "./i18n";

export const defaultPythonProject = {
  project_type: "python",
  name: i18n.t("project.untitled"),
  locale: null,
  components: [{ extension: "py", name: "main", content: "", default: true }],
  images: [],
};

export const defaultHtmlProject = {
  project_type: "html",
  name: i18n.t("project.untitled"),
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
