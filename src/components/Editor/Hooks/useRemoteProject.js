/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { setProject, setProjectLoaded } from '../EditorSlice'
import axios from 'axios';

export const useRemoteProject = (projectType, projectIdentifier = '') => {
  const dispatch = useDispatch();

  const loadProject = () => {
  }

  const loadDefaultProject = () => {
    (async () => {

      const host = process.env.REACT_APP_API_ENDPOINT;
      const response = await axios.get(`${host}/api/default_project/${projectType}`);
      dispatch(setProject(response.data));
      dispatch(setProjectLoaded(true));
    })();
  }

  useEffect(() => {
    if (projectIdentifier) {
    } else {
      loadDefaultProject();
    }
  }, []);
};

