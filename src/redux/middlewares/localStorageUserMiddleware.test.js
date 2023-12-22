import configureStore from "redux-mock-store";

import localStorageUserMiddleware from "./localStorageUserMiddleware";

describe(`localStorageUserMiddleware`, () => {
  let store;
  let next = jest.fn();
  let setUser = jest.fn();
  let user = { user: "some-user" };
  const middleware = [localStorageUserMiddleware(setUser)];
  const mockStore = configureStore({
    reducer: setUser,
    middleware,
  });

  describe("as a cold user", () => {
    beforeEach(() => {
      const initialState = {
        editor: {},
        auth: {},
      };
      store = mockStore(initialState);
      store.dispatch = jest.fn();
    });

    describe(`when user is set in local storage`, () => {
      beforeEach(() => {
        localStorage.setItem("authKey", "some-key");
        localStorage.setItem("some-key", JSON.stringify(user));
      });

      it(`expects setUser to be called`, () => {
        localStorageUserMiddleware(setUser)(store)(next)({
          type: "editor/someAction",
        });
        expect(setUser).toBeCalledWith(user);
      });
    });

    describe(`when authKey is not set in local storage`, () => {
      beforeEach(() => {
        localStorage.removeItem("authKey");
      });

      it(`expects setUser to not be called`, () => {
        localStorageUserMiddleware(setUser)(store)(next)({
          type: "editor/someAction",
        });
        expect(setUser).not.toBeCalled();
      });
    });
  });

  describe("as a logged in user", () => {
    const updatedUser = { user: "updated-user" };

    beforeEach(() => {
      const initialState = {
        editor: {},
        auth: { user },
      };
      store = mockStore(initialState);
      store.dispatch = jest.fn();
    });

    describe(`when user in local storage has been updated`, () => {
      beforeEach(() => {
        localStorage.setItem("authKey", "some-key");
        localStorage.setItem("some-key", JSON.stringify(updatedUser));
      });

      it(`expects setUser to be called`, () => {
        localStorageUserMiddleware(setUser)(store)(next)({
          type: "editor/someAction",
        });
        expect(setUser).toBeCalledWith(updatedUser);
      });
    });

    describe(`when authKey is not set in local storage`, () => {
      beforeEach(() => {
        localStorage.removeItem("authKey");
        localStorage.setItem("some-key", JSON.stringify(updatedUser));
      });

      it(`expects setUser to not be called`, () => {
        localStorageUserMiddleware(setUser)(store)(next)({
          type: "editor/someAction",
        });
        expect(setUser).not.toBeCalled();
      });
    });
  });
});
