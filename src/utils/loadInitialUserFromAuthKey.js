import store from "../redux/stores/WebComponentStore";
import { setUser } from "../redux/WebComponentAuthSlice";

const loadInitialUserFromAuthKey = (authKey) => {
  if (!authKey) {
    return;
  }

  const localStorageUser = JSON.parse(localStorage.getItem(authKey));
  store.dispatch(setUser(localStorageUser));
};

export default loadInitialUserFromAuthKey;
