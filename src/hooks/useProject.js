/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncProject, setProject } from "../redux/EditorSlice";
import { createDefaultPythonProject } from "../utils/defaultProjects";
import { useTranslation } from "react-i18next";
import { projectHasChangedSinceInitialLoad } from "../utils/projectHelpers";

export const useProject = ({
  reactAppApiEndpoint = null,
  assetsIdentifier = null,
  projectIdentifier = null,
  initialProject = null,
  code = null,
  accessToken = null,
  loadRemix = false,
  loadCache = true,
  remixLoadFailed = false,
  locale = null,
  embedded = false,
}) => {
  const loading = useSelector((state) => state.editor.loading);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const isBrowserPreview = useSelector((state) => state.editor.browserPreview);
  const browserPreviewFromQuery =
    new URLSearchParams(window.location.search).get("browserPreview") ===
    "true";
  const isEmbeddedMode = embedded || isEmbedded;
  const canUseBrowserPreviewCache =
    isBrowserPreview || (embedded && browserPreviewFromQuery);
  const shouldSkipCache = isEmbeddedMode && !canUseBrowserPreviewCache;
  const project = useSelector((state) => state.editor.project);
  const initialComponents = useSelector(
    (state) => state.editor.initialComponents,
  );
  const loadDispatched = useRef(false);

  const getCachedProject = (id) =>
    shouldSkipCache ? null : JSON.parse(localStorage.getItem(id || "project"));
  const [cachedProject, setCachedProject] = useState(
    getCachedProject(projectIdentifier),
  );
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const effectiveLocale = locale ?? i18n.language;
  const hasAccessToken = Boolean(accessToken);

  const loadCachedProject = () => {
    dispatch(setProject(cachedProject));
  };

  useEffect(() => {
    setCachedProject(getCachedProject(projectIdentifier));
  }, [projectIdentifier]);

  useEffect(() => {
    let didUnmount = false;

    const loadProjectData = async () => {
      if (loadRemix) {
        return;
      }

      const isCachedSavedProject =
        projectIdentifier &&
        cachedProject &&
        cachedProject.identifier === projectIdentifier;
      const isCachedUnsavedProject =
        !projectIdentifier && cachedProject && !initialProject;
      const cachedProjectMatchesRequest =
        isCachedSavedProject || isCachedUnsavedProject;
      const currentProjectMatchesRequest = projectIdentifier
        ? project?.identifier === projectIdentifier
        : !project?.identifier;
      const currentProjectChanged = projectHasChangedSinceInitialLoad(
        project,
        initialComponents,
      );

      // If this same project has local edits, keep them across rerenders such
      // as locale, access-token, or cache changes until the user saves or remixes.
      if (currentProjectMatchesRequest && currentProjectChanged) {
        return;
      }

      // Browser previews need the current local edits. Starter projects can be
      // served from a fallback locale, so the cached locale may not match the URL.
      const cachedLocaleMatches = cachedProject?.locale === effectiveLocale;

      if (
        loadCache &&
        cachedProjectMatchesRequest &&
        (cachedLocaleMatches || canUseBrowserPreviewCache)
      ) {
        loadCachedProject();
        return;
      }

      if (assetsIdentifier) {
        dispatch(
          syncProject("load")({
            reactAppApiEndpoint,
            identifier: assetsIdentifier,
            locale: effectiveLocale,
            accessToken,
            assetsOnly: true,
          }),
        );
        return;
      }

      if (projectIdentifier) {
        dispatch(
          syncProject("load")({
            reactAppApiEndpoint,
            identifier: projectIdentifier,
            locale: effectiveLocale,
            accessToken: accessToken,
          }),
        );
        return;
      }

      if (initialProject) {
        const project = JSON.parse(initialProject);
        dispatch(setProject(project));
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

      const data = await createDefaultPythonProject(effectiveLocale);

      if (didUnmount) {
        return;
      }

      dispatch(setProject(data));
    };

    void loadProjectData();

    return () => {
      didUnmount = true;
    };
  }, [
    code,
    projectIdentifier,
    cachedProject,
    effectiveLocale,
    hasAccessToken,
    loadRemix,
    initialProject,
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
        }),
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
          locale: effectiveLocale,
          accessToken: accessToken,
        }),
      );

      loadDispatched.current = true;
    }
  }, [projectIdentifier, effectiveLocale, accessToken, remixLoadFailed]);

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
            !(
              component.name === defaultName &&
              component.extension === defaultExtension
            ),
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
