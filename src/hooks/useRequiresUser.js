import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'

export const useRequiresUser = (isLoading, user) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isLoading && !user) {
      navigate("/");
    }
  }, [isLoading, user]);
};
