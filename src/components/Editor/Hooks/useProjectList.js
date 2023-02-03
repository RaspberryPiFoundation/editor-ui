/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { loadProjectList } from '../EditorSlice'

export const useProjectList = (user) => {
  const dispatch = useDispatch();
  const projectListLoaded = useSelector((state) => state.editor.projectListLoaded);
  const projectIndexCurrentPage = useSelector((state) => state.editor.projectIndexCurrentPage)

  useEffect(() => {
    if (user && projectListLoaded === 'idle') {
      dispatch(loadProjectList({page: projectIndexCurrentPage, accessToken: user.access_token}));
    }
  }, [user, projectListLoaded]);
};

