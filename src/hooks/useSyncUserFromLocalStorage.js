import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/WebComponentAuthSlice";

const DEFAULT_INTERVAL_MS = 45000;

export const useSyncUserFromLocalStorage = ({
  authKey,
  user,
  interval = DEFAULT_INTERVAL_MS,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!Boolean(authKey)) {
      return;
    }

    const syncUser = () => {
      if (!Boolean(authKey)) {
        return;
      }

      const localStorageUser = JSON.parse(localStorage.getItem(authKey));

      if (user?.access_token === localStorageUser?.access_token) {
        return;
      }

      dispatch(setUser(localStorageUser));
    };

    const intervalId = window.setInterval(syncUser, interval);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [authKey, user?.access_token, interval, dispatch]);
};
