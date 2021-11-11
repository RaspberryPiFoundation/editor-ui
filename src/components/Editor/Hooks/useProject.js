/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { setProject, setProjectLoaded } from '../EditorSlice'
import axios from 'axios';

export const useProject = (projectType) => {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const response = await axios.get(`/api/default_project/${projectType}`);
      dispatch(setProject(response.data));
      dispatch(setProjectLoaded(true));
    })();
  }, []);
};

