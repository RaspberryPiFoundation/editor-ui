export const defaultPythonProject = (i18n) => ({
  project_type: "python",
  name: i18n.t("project.untitled"),
  locale: null,
  components: [{ extension: "py", name: "main", content: "", default: true }],
  image_list: [],
});

export const defaultHtmlProject = (i18n) => ({
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
});

export const DEFAULT_PROJECTS = {
  python: defaultPythonProject,
  html: defaultHtmlProject,
};
