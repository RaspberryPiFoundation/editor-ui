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
