import produce from "immer";

import ApiCallHandler from "../../utils/apiCallHandler";
import reducer, { syncProject } from "../../redux/EditorSlice";
import { loadProjectRejected } from "./loadProjectReducers";

jest.mock("../../utils/apiCallHandler");

const { readProject } = ApiCallHandler({ reactAppApiEndpoint: "TODO" });
const requestingAProject = function (project, projectFile) {
  const dispatch = jest.fn();
  const initialState = {
    editor: {
      project: {},
      loading: "idle",
    },
    auth: {
      isLoadingUser: false,
    },
  };

  let loadThunk;
  let loadAction;

  let loadFulfilledAction;
  let loadRejectedAction;

  beforeEach(() => {
    loadThunk = syncProject("load");
    loadAction = loadThunk({
      identifier: "my-project-identifier",
      locale: "ja-JP",
      accessToken: "my_token",
    });

    loadFulfilledAction = loadThunk.fulfilled({ project });
    loadFulfilledAction.meta.requestId = "my_request_id";
    loadRejectedAction = loadThunk.rejected();
    loadRejectedAction.meta.requestId = "my_request_id";
  });

  test("Reads project from database", async () => {
    await loadAction(dispatch, () => initialState);
    expect(readProject).toHaveBeenCalledWith(
      "my-project-identifier",
      "ja-JP",
      "my_token",
    );
  });

  test("If loading status pending, loading success updates status", () => {
    const initialState = {
      openFiles: [[]],
      loading: "pending",
      currentLoadingRequestId: "my_request_id",
    };
    const expectedState = {
      openFiles: [[projectFile]],
      focussedFileIndices: [0],
      loading: "success",
      justLoaded: true,
      saving: "idle",
      project: project,
      currentLoadingRequestId: undefined,
    };
    expect(reducer(initialState, loadFulfilledAction)).toEqual(expectedState);
  });

  test("If not latest request, loading success does not update status", () => {
    const initialState = {
      loading: "pending",
      currentLoadingRequestId: "another_request_id",
    };
    expect(reducer(initialState, loadFulfilledAction)).toEqual(initialState);
  });

  test("If already rejected, loading success does not update status", () => {
    const initialState = {
      loading: "failed",
    };
    expect(reducer(initialState, syncProject("load").fulfilled())).toEqual(
      initialState,
    );
  });

  test("If loading status pending, loading failure updates status", () => {
    const initialState = {
      loading: "pending",
      currentLoadingRequestId: "my_request_id",
    };
    const expectedState = {
      loading: "failed",
      saving: "idle",
      currentLoadingRequestId: undefined,
    };
    expect(reducer(initialState, loadRejectedAction)).toEqual(expectedState);
  });

  test("If not latest request, loading failure does not update status", () => {
    const initialState = {
      loading: "pending",
      currentLoadingRequestId: "another_request_id",
    };
    expect(reducer(initialState, loadRejectedAction)).toEqual(initialState);
  });

  test("If already fulfilled, loading rejection does not update status", () => {
    const initialState = {
      loading: "success",
    };
    expect(reducer(initialState, loadThunk.rejected())).toEqual(initialState);
  });
};

describe("When requesting a python project", () => {
  const project = {
    name: "hello world",
    project_type: "python",
    identifier: "my-project-identifier",
    components: [
      {
        name: "main",
        extension: "py",
        content: "# hello",
      },
    ],
    image_list: [],
  };
  requestingAProject(project, "main.py");
});

describe("When requesting a HTML project", () => {
  const project = {
    name: "hello html world",
    project_type: "html",
    identifier: "my-project-identifier",
    components: [
      {
        name: "index",
        extension: "html",
        content: "# hello world",
      },
    ],
    image_list: [],
  };
  requestingAProject(project, "index.html");
});

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
