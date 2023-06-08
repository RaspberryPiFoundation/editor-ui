import { readProject } from "../../../utils/apiCallHandler";
import reducer, { syncProject } from "../EditorSlice";

jest.mock("../../../utils/apiCallHandler");

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

describe("When the action is rejected with an error", () => {
  let initialState = {
    loading: "pending",
    saving: "idle",
    currentLoadingRequestId: "id-of-a-testy-thing",
  };

  let loadThunk;
  let loadRejectedAction;

  beforeEach(() => {
    loadThunk = syncProject("load");
    loadRejectedAction = loadThunk.rejected();
    loadRejectedAction.meta = {
      requestId: "id-of-a-testy-thing",
      arg: {
        accessToken: null,
        identifier: "I am he",
        projectType: "Err",
      },
    };
  });

  test("If the error is a 404, it sets up state accordingly", () => {
    loadRejectedAction.error.message = "Request failed with status code 404";

    const expectedState = {
      loading: "failed",
      saving: "idle",
      accessDeniedWithAuthModalShowing: undefined,
      accessDeniedNoAuthModalShowing: undefined,
      notFoundModalShowing: true,
      currentLoadingRequestId: undefined,
    };
    expect(reducer(initialState, loadRejectedAction)).toEqual(expectedState);
  });

  describe("When it errors with an auth token", () => {
    let expectedState;

    beforeEach(() => {
      loadRejectedAction.meta.arg.accessToken = "I exist";

      expectedState = {
        loading: "failed",
        saving: "idle",
        accessDeniedWithAuthModalShowing: true,
        accessDeniedNoAuthModalShowing: undefined,
        notFoundModalShowing: undefined,
        currentLoadingRequestId: undefined,
      };
    });

    test("If the error is a 500 and there is a token, it sets up state accordingly", () => {
      loadRejectedAction.error.message = "Request failed with status code 500";
      expect(reducer(initialState, loadRejectedAction)).toEqual(expectedState);
    });

    test("If the error is a 403 and there is a token, itsets up state accordingly", () => {
      loadRejectedAction.error.message = "Request failed with status code 403";
      expect(reducer(initialState, loadRejectedAction)).toEqual(expectedState);
    });

    test("If the error is any other status code and there is a token, it sets up state accordingly", () => {
      loadRejectedAction.error.message = "Request failed with status code 404";
      expect(reducer(initialState, loadRejectedAction)).not.toEqual(
        expectedState,
      );
    });
  });

  describe("When it errors without an auth token", () => {
    let expectedState;

    beforeEach(() => {
      initialState = {
        ...initialState,
        modals: {
          accessDenied: {},
        },
      };

      expectedState = {
        loading: "failed",
        saving: "idle",
        accessDeniedWithAuthModalShowing: undefined,
        accessDeniedNoAuthModalShowing: true,
        notFoundModalShowing: undefined,
        currentLoadingRequestId: undefined,
        modals: {
          accessDenied: {
            identifier: "I am he",
            projectType: "Err",
          },
        },
      };
    });

    test("If the error is a 500 and there is a token, it sets up state accordingly", () => {
      loadRejectedAction.error.message = "Request failed with status code 500";
      expect(reducer(initialState, loadRejectedAction)).toEqual(expectedState);
    });

    test("If the error is a 403 and there is a token, it sets up state accordingly", () => {
      loadRejectedAction.error.message = "Request failed with status code 403";
      expect(reducer(initialState, loadRejectedAction)).toEqual(expectedState);
    });

    test("If the error is a 401 and there is a token, it sets up state accordingly", () => {
      loadRejectedAction.error.message = "Request failed with status code 401";
      expect(reducer(initialState, loadRejectedAction)).toEqual(expectedState);
    });
  });
});
