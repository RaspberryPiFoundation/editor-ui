/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { syncProject, setProject } from "../EditorSlice";
import { defaultPythonProject } from "../../../utils/defaultProjects";
import { useTranslation } from "react-i18next";

export const useProject = (projectIdentifier = null, accessToken = null) => {
  const getCachedProject = (id) =>
    JSON.parse(localStorage.getItem(id || "project"));
  const [cachedProject, setCachedProject] = useState(
    getCachedProject(projectIdentifier)
  );
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);
  const dispatch = useDispatch();

  const loadCachedProject = () => {
    dispatch(setProject(cachedProject));
  };

  useEffect(() => {
    setCachedProject(getCachedProject(projectIdentifier));
  }, [projectIdentifier]);

  useEffect(() => {
    if (i18n.language === currentLanguage) {
      const is_cached_saved_project =
        projectIdentifier &&
        cachedProject &&
        cachedProject.identifier === projectIdentifier;
      const is_cached_unsaved_project = !projectIdentifier && cachedProject;

      if (is_cached_saved_project || is_cached_unsaved_project) {
        loadCachedProject();
        setCurrentLanguage(i18n.language);
        return;
      }

      if (projectIdentifier) {
        dispatch(
          syncProject("load")({
            identifier: projectIdentifier,
            locale: i18n.language,
            accessToken,
          })
        );
        setCurrentLanguage(i18n.language);
        return;
      }
      const data = defaultPythonProject;
      dispatch(setProject(data));
      setCurrentLanguage(i18n.language);
    }
  }, [
    projectIdentifier,
    cachedProject,
    i18n.language,
    accessToken,
    currentLanguage,
  ]);
};
