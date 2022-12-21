/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { syncProject, setProject } from '../EditorSlice'
import { defaultHtmlProject, defaultPythonProject } from '../../../utils/defaultProjects';

export const useProject = (projectType, projectIdentifier = null, accessToken = null) => {
  const dispatch = useDispatch();

  const cachedProject = JSON.parse(localStorage.getItem(projectIdentifier || 'project'))
  const loadCachedProject = () => {
    dispatch(setProject(cachedProject))
    localStorage.removeItem(projectIdentifier || 'project')
  }

  useEffect(() => {
    var is_cached_saved_project = (projectIdentifier && cachedProject && cachedProject.identifier === projectIdentifier)
    var is_cached_unsaved_project = (!projectIdentifier && cachedProject)
    if (is_cached_saved_project || is_cached_unsaved_project) {
      loadCachedProject()
      return
    }

    if (projectIdentifier) {
      dispatch(syncProject('load')({identifier: projectIdentifier, projectType, accessToken}));
      return;
    }

    let data = {};
    if(projectType === 'html') {
      data = defaultHtmlProject;
    } else {
      data = defaultPythonProject;
    }

    dispatch(setProject(data));
  }, [projectIdentifier, accessToken]);
};
