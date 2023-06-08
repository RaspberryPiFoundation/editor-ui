import produce from "immer";
import { loadProjectRejected } from "./loadProjectReducers";

describe("EditorSliceReducers::loadProjectRejectedReducer", () => {
  let action;
  let initialState;

  beforeEach(() => {
    action = {
      meta: {
        requestId: "id-of-a-testy-thing",
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
});
