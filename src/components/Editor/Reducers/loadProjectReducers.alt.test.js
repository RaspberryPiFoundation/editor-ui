import produce from "immer";
import { loadProjectRejected } from "./loadProjectReducers";

describe("EditorSliceReducers::loadProjectRejectedReducer", () => {
  let action;
  let initialState;

  beforeEach(() => {
    action = {
      meta: {
        requestId: "id-of-a-testy-thing",
        arg: {
          accessToken: null,
        },
      },
      error: {},
    };

    initialState = {
      loading: "pending",
      saving: "idle",
      currentLoadingRequestId: "id-of-a-testy-thing",
    };
  });

  test("sets the expected state for a 404", () => {
    action.error.message = "Request failed with status code 404";

    const expectedState = {
      loading: "failed",
      saving: "idle",
      notFoundModalShowing: true,
      currentLoadingRequestId: undefined,
    };

    const newState = produce(initialState, (draft) => {
      loadProjectRejected(draft, action);
    });

    expect(newState).toEqual(expectedState);
  });

  describe("when an auth token HAS been set", () => {
    let expectedState = {
      loading: "failed",
      saving: "idle",
      accessDeniedWithAuthModalShowing: true,
      currentLoadingRequestId: undefined,
    };

    beforeEach(() => {
      action.meta.arg.accessToken = "I am token thing";
    });

    test("sets the expected state for a 500", () => {
      action.error.message = "Request failed with status code 500";

      const newState = produce(initialState, (draft) => {
        loadProjectRejected(draft, action);
      });

      expect(newState).toEqual(expectedState);
    });

    test("sets the expected state for a 403", () => {
      action.error.message = "Request failed with status code 403";

      const newState = produce(initialState, (draft) => {
        loadProjectRejected(draft, action);
      });

      expect(newState).toEqual(expectedState);
    });

    test("sets the expected state for a 401", () => {
      action.error.message = "Request failed with status code 401";

      const newState = produce(initialState, (draft) => {
        loadProjectRejected(draft, action);
      });

      expect(newState).toEqual(expectedState);
    });

    test("does not set the expected state for an unsupported status code", () => {
      action.error.message = "Request failed with status code 404";

      const newState = produce(initialState, (draft) => {
        loadProjectRejected(draft, action);
      });

      expect(newState).not.toEqual(expectedState);
    });
  });

  describe("when an auth token HAS NOT been set", () => {
    let expectedState = {
      loading: "failed",
      saving: "idle",
      accessDeniedNoAuthModalShowing: true,
      currentLoadingRequestId: undefined,
      modals: {
        accessDenied: {
          identifier: "I am he",
          projectType: "Err",
        },
      },
    };

    beforeEach(() => {
      initialState = {
        ...initialState,
        modals: {
          accessDenied: {},
        },
      };

      action.meta = {
        requestId: "id-of-a-testy-thing",
        arg: {
          accessToken: null, // to be explicit...
          identifier: "I am he",
          projectType: "Err",
        },
      };
    });

    test("sets the expected state for a 500", () => {
      action.error.message = "Request failed with status code 500";

      const newState = produce(initialState, (draft) => {
        loadProjectRejected(draft, action);
      });

      expect(newState).toEqual(expectedState);
    });

    test("sets the expected state for a 403", () => {
      action.error.message = "Request failed with status code 403";

      const newState = produce(initialState, (draft) => {
        loadProjectRejected(draft, action);
      });

      expect(newState).toEqual(expectedState);
    });

    test("sets the expected state for a 401", () => {
      action.error.message = "Request failed with status code 401";

      const newState = produce(initialState, (draft) => {
        loadProjectRejected(draft, action);
      });

      expect(newState).toEqual(expectedState);
    });

    test("does not set the expected state for an unsupported status code", () => {
      action.error.message = "Request failed with status code 404";

      const newState = produce(initialState, (draft) => {
        loadProjectRejected(draft, action);
      });

      expect(newState).not.toEqual(expectedState);
    });
  });
});
