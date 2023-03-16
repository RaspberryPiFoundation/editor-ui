/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { syncProject, setProject } from '../EditorSlice'
import { defaultPythonProject } from '../../../utils/defaultProjects';
import i18n from 'i18next'

export const useProject = (projectIdentifier = null, locale = null, accessToken = null) => {
  const dispatch = useDispatch();

  const cachedProject = JSON.parse(localStorage.getItem(projectIdentifier || 'project'))
  const loadCachedProject = () => {
    dispatch(setProject(cachedProject))
  }

  useEffect(() => {
    if (locale === i18n.language) {
      var is_cached_saved_project = (projectIdentifier && cachedProject && cachedProject.identifier === projectIdentifier)
      var is_cached_unsaved_project = (!projectIdentifier && cachedProject)

      if (is_cached_saved_project || is_cached_unsaved_project) {
        loadCachedProject()
        return
      }

      if (projectIdentifier) {
        dispatch(syncProject('load')({identifier: projectIdentifier, locale, accessToken}));
        return;
      }
      const data = defaultPythonProject;
      dispatch(setProject(data));
    }
  }, [projectIdentifier, locale, accessToken]);
};
