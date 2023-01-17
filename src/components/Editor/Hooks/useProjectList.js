/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { loadProjectList } from '../EditorSlice'

export const useProjectList = (page, user) => {
  const dispatch = useDispatch();
  const projectListLoaded = useSelector((state) => state.editor.projectListLoaded);

  useEffect(() => {
    if(!user || projectListLoaded === 'success') {
      return;
    }
    dispatch(loadProjectList({page, accessToken: user.access_token}));
  }, [user, projectListLoaded]);
};

