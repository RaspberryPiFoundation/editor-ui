/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { setProjectList, setProjectListLoaded } from '../EditorSlice'
import { readProjectList } from '../../../utils/apiCallHandler';

export const useProjectList = (user) => {
  const dispatch = useDispatch();

  const loadProjectList = () => {
    (async () => {
      const response = await readProjectList(user.access_token)
      dispatch(setProjectList(response.data));
      dispatch(setProjectListLoaded(true));
    })();
  }

  useEffect(() => {
    if(!user) {
      return;
    }
    loadProjectList();
  }, [user]);
};

