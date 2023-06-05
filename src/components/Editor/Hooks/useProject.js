/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { syncProject, setProject } from "../EditorSlice";
import { defaultPythonProject } from "../../../utils/defaultProjects";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

export const useProject = ({
  projectIdentifier = null,
  accessToken = null,
  isEmbedded = false,
}) => {
  const [searchParams] = useSearchParams();
  const getCachedProject = (id) =>
    isEmbedded && searchParams.get("browserPreview") !== "true"
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

    if (projectIdentifier) {
      dispatch(
        syncProject("load")({
          identifier: projectIdentifier,
          locale: i18n.language,
          accessToken,
        }),
      );
      return;
    }
    const data = defaultPythonProject;
    dispatch(setProject(data));
  }, [projectIdentifier, cachedProject, i18n.language, accessToken]);
};
