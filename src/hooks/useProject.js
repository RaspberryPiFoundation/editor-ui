/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncProject, setProject } from "../redux/EditorSlice";
import { defaultPythonProject } from "../utils/defaultProjects";
import { useTranslation } from "react-i18next";

export const useProject = ({
  reactAppApiEndpoint = null,
  assetsIdentifier = null,
  projectIdentifier = null,
  code = null,
  accessToken = null,
  loadRemix = false,
  loadCache = true,
  remixLoadFailed = false,
  id,
}) => {
  const loading = useSelector((state) => state.editor.loading);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const isBrowserPreview = useSelector((state) => state.editor.browserPreview);
  const project = useSelector((state) => state.editor.project);
  const loadDispatched = useRef(false);

  const getCachedProject = (id) =>
    isEmbedded && !isBrowserPreview
      ? null
      : JSON.parse(localStorage.getItem(id || `${id}-project`));
  const [cachedProject, setCachedProject] = useState(
    getCachedProject(projectIdentifier)
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
    if (!loadRemix) {
      const is_cached_saved_project =
        projectIdentifier &&
        cachedProject &&
        cachedProject.identifier === projectIdentifier;
      const is_cached_unsaved_project = !projectIdentifier && cachedProject;

      if (loadCache && (is_cached_saved_project || is_cached_unsaved_project)) {
        loadCachedProject();
        return;
      }

      if (assetsIdentifier) {
        dispatch(
          syncProject("load")({
            reactAppApiEndpoint,
            identifier: assetsIdentifier,
            locale: i18n.language,
            accessToken,
            assetsOnly: true,
          })
        );
        return;
      }

      if (projectIdentifier) {
        dispatch(
          syncProject("load")({
            reactAppApiEndpoint,
            identifier: projectIdentifier,
            locale: i18n.language,
            accessToken: accessToken,
          })
        );
        return;
      }

      if (code) {
        const project = {
          name: "Blank project",
          project_type: "python",
          components: [{ name: "main", extension: "py", content: code }],
        };
        dispatch(setProject(project));
        return;
      }

      const data = defaultPythonProject;
      dispatch(setProject(data));
    }
  }, [
    code,
    projectIdentifier,
    cachedProject,
    i18n.language,
    accessToken,
    loadRemix,
  ]);

  // Try to load the remix, if it fails set `remixLoadFailed` true, and load the project in the next useEffect
  useEffect(() => {
    if (!projectIdentifier || !accessToken || !loadRemix) return;

    if (!remixLoadFailed && !loadDispatched.current) {
      dispatch(
        syncProject("loadRemix")({
          reactAppApiEndpoint,
          identifier: projectIdentifier,
          accessToken: accessToken,
        })
      );

      // Prevents a failure on the initial render (using a ref to avoid triggering a render)
      loadDispatched.current = true;
    }
  }, [projectIdentifier, accessToken, project, loadRemix, remixLoadFailed]);

  useEffect(() => {
    if (!projectIdentifier || !loadRemix) return;

    if (remixLoadFailed && !loadDispatched.current) {
      dispatch(
        syncProject("load")({
          reactAppApiEndpoint,
          identifier: projectIdentifier,
          locale: i18n.language,
          accessToken: accessToken,
        })
      );

      loadDispatched.current = true;
    }
  }, [projectIdentifier, i18n.language, accessToken, remixLoadFailed]);

  useEffect(() => {
    if (code && loading === "success") {
      const defaultName = project.project_type === "html" ? "index" : "main";
      const defaultExtension = project.project_type === "html" ? "html" : "py";

      const mainComponent = project.components?.find(
        (component) =>
          component.name === defaultName &&
          component.extension === defaultExtension
      ) || { name: defaultName, extension: defaultExtension, content: "" };

      const otherComponents =
        project.components?.filter(
          (component) =>
            !(
              component.name === defaultName &&
              component.extension === defaultExtension
            )
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
