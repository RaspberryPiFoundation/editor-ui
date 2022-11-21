/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { loadProject, setProject, setProjectLoaded } from '../EditorSlice'
import { readProject } from '../../../utils/apiCallHandler';
import { defaultHtmlProject, defaultPythonProject } from '../../../utils/defaultProjects';

export const useProject = (projectType, projectIdentifier = '') => {
  const dispatch = useDispatch();

  // const loadProject = () => {
  //   (async () => {
  //     const response = await readProject(projectIdentifier)
  //     dispatch(setProject(response.data));
  //     // dispatch(setProjectLoaded(true));
  //   })();
  // }

  const cachedProject = JSON.parse(localStorage.getItem(projectIdentifier || 'project'))
  const loadCachedProject = () => {
    dispatch(setProject(cachedProject))
    // dispatch(setProjectLoaded(true));
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
      dispatch(loadProject(projectIdentifier));
      return;
    }

    let data = {};
    if(projectType === 'html') {
      data = defaultHtmlProject;
    } else {
      data = defaultPythonProject;
    }

    dispatch(setProject(data));
    // dispatch(setProjectLoaded(true));
  }, [projectIdentifier]);
};

