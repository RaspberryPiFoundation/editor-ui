import { setUser, removeUser } from "./webComponentAuthReducers";

const user = {
  access_token: "my_token",
};

test("Sets user correctly", () => {
  let state = {};
  const expectedState = { user };
  setUser(state, { payload: user });
  expect(state).toEqual(expectedState);
});

test("Removes user correctly", () => {
  let state = { user };
  const expectedState = { user: null };

  removeUser(state);
  expect(state).toEqual(expectedState);
});
