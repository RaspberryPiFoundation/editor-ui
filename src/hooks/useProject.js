/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncProject, setProject } from "../redux/EditorSlice";
import { defaultPythonProject } from "../utils/defaultProjects";
import { useTranslation } from "react-i18next";

export const useProject = ({
  assetsIdentifier = null,
  projectIdentifier = null,
  code = null,
  accessToken = null,
}) => {
  const project = useSelector((state) => state.editor.project);
  const loading = useSelector((state) => state.editor.loading);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const isBrowserPreview = useSelector((state) => state.editor.browserPreview);
  const getCachedProject = (id) =>
    isEmbedded && !isBrowserPreview
      ? null
      : JSON.parse(localStorage.getItem(id || "project"));
  const [cachedProject, setCachedProject] = useState(
    getCachedProject(projectIdentifier),
  );
  const { i18n } = useTranslation();
  const dispatch = useDispatch();

  const loadCachedProject = () => {
    dispatch(setProject(cachedProject));
  };

  useEffect(() => {
    setCachedProject(getCachedProject(projectIdentifier));
  }, [projectIdentifier]);

  useEffect(() => {
    const is_cached_saved_project =
      projectIdentifier &&
      cachedProject &&
      cachedProject.identifier === projectIdentifier;
    const is_cached_unsaved_project = !projectIdentifier && cachedProject;

    if (is_cached_saved_project || is_cached_unsaved_project) {
      loadCachedProject();
      return;
    }

    if (assetsIdentifier) {
      dispatch(
        syncProject("load")({
          identifier: assetsIdentifier,
          locale: i18n.language,
          accessToken,
          assetsOnly: true,
        }),
      );
      return;
    }

    if (projectIdentifier) {
      dispatch(
        syncProject("load")({
          identifier: projectIdentifier,
          locale: i18n.language,
          accessToken: accessToken,
        }),
      );
      return;
    }

    if (code) {
      const project = {
        name: "Blank project",
        type: "python",
        components: [{ name: "main", extension: "py", content: code }],
      };
      dispatch(setProject(project));
      return;
    }

    const data = defaultPythonProject;
    dispatch(setProject(data));
  }, [projectIdentifier, cachedProject, i18n.language, accessToken]);

  useEffect(() => {
    if (code && loading === "success") {
      const defaultName = project.project_type === "html" ? "index" : "main";
      const defaultExtension = project.project_type === "html" ? "html" : "py";

      const mainComponent = project.components?.find(
        (component) =>
          component.name === defaultName &&
          component.extension === defaultExtension,
      ) || { name: defaultName, extension: defaultExtension, content: "" };

      const otherComponents =
        project.components?.filter(
          (component) =>
            component.name !== defaultName &&
            component.extension !== defaultExtension,
        ) || [];

      const updatedProject = {
        ...project,
        project_type: project.project_type || "python",
        components: [
          ...otherComponents,
          {
            ...mainComponent,
            content: code,
          },
        ],
      };
      dispatch(setProject(updatedProject));
    }
  }, [code, loading]);
};
