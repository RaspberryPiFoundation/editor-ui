export const setUser = (state, action) => {
  state.user = action.payload;
};

export const removeUser = (state) => {
  state.user = null;
};

export const reducers = { setUser, removeUser };
