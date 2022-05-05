/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom'

export const useRequiresUser = (isLoading, user) => {
  const history = useHistory()

  useEffect(() => {
    if(isLoading) {
      return;
    }

    if(!isLoading && !user) {
      history.push('/')
    }
  }, [isLoading, user]);
};

