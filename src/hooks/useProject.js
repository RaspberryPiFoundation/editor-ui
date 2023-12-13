/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { syncProject, setProject } from "../redux/EditorSlice";
import { defaultPythonProject } from "../utils/defaultProjects";
import { useTranslation } from "react-i18next";

export const useProject = ({
  projectIdentifier = null,
  code = null,
  accessToken = null,
  loadRemix = false,
  loadCache = true,
}) => {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const isBrowserPreview = useSelector((state) => state.editor.browserPreview);
  const remixLoadFailed = useSelector((state) => state.editor.remixLoadFailed);
  const project = useSelector((state) => state.editor.project);

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

    if (loadCache && (is_cached_saved_project || is_cached_unsaved_project)) {
      loadCachedProject();
      return;
    }

    if (projectIdentifier) {
      if (loadRemix && accessToken && !!!project?.user_id && !remixLoadFailed) {
        dispatch(
          syncProject("loadRemix")({
            identifier: projectIdentifier,
            accessToken: accessToken,
          }),
        );
        return;
      } else {
        dispatch(
          syncProject("load")({
            identifier: projectIdentifier,
            locale: i18n.language,
            accessToken: accessToken,
          }),
        );
        return;
      }
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
  }, [
    projectIdentifier,
    cachedProject,
    i18n.language,
    accessToken,
    remixLoadFailed,
  ]);
};
