const localStorageUserMiddleware =
  (setUser) => (store) => (next) => (action) => {
    if (action.type.startsWith("editor")) {
      const authKey = localStorage.getItem("authKey");
      if (authKey) {
        const localStorageUser = JSON.parse(localStorage.getItem(authKey));
        if (
          JSON.stringify(store.getState().auth.user) !==
          JSON.stringify(localStorageUser)
        ) {
          store.dispatch(setUser(localStorageUser));
        }
      }
    }
    next(action);
  };

export default localStorageUserMiddleware;
