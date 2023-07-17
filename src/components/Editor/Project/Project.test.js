import React from "react";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Project from "./Project";
import {
  expireJustLoaded,
  setHasShownSavePrompt,
  syncProject,
} from "../EditorSlice";
import {
  showLoginPrompt,
  showSavedMessage,
  showSavePrompt,
} from "../../../utils/Notifications";
import { MemoryRouter } from "react-router-dom";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock("axios");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

jest.mock("../EditorSlice", () => ({
  ...jest.requireActual("../EditorSlice"),
  syncProject: jest.fn((_) => jest.fn()),
}));

jest.mock("../../../utils/Notifications");

jest.useFakeTimers();

const user1 = {
  access_token: "myAccessToken",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

const user2 = {
  access_token: "myAccessToken",
  profile: {
    user: "cd8a5b3d-f7bb-425e-908f-1386decd6bb1",
  },
};

const project = {
  name: "hello world",
  project_type: "python",
  identifier: "hello-world-project",
  components: [
    {
      name: "main",
      extension: "py",
      content: "# hello",
    },
  ],
  user_id: user1.profile.user,
};

test("Renders with file menu if not for web component", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [],
      },
      openFiles: [[]],
      focussedFileIndices: [0],
    },
    auth: {},
  };
  const store = mockStore(initialState);
  const { queryByText } = render(
    <Provider store={store}>
      <MemoryRouter>
        <div id="app">
          <Project />
        </div>
      </MemoryRouter>
    </Provider>,
  );
  expect(queryByText("filePane.files")).not.toBeNull();
});

test("Renders without file menu if for web component", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [],
      },
      openFiles: [[]],
      focussedFileIndices: [0],
    },
    auth: {},
  };
  const store = mockStore(initialState);
  const { queryByText } = render(
    <Provider store={store}>
      <MemoryRouter>
        <Project forWebComponent={true} />
      </MemoryRouter>
    </Provider>,
  );
  expect(queryByText("filePane.files")).toBeNull();
});

describe("When not logged in and just loaded", () => {
  let mockedStore;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        loading: "success",
        justLoaded: true,
        openFiles: [[]],
        focussedFileIndices: [0],
      },
      auth: {},
    };
    mockedStore = mockStore(initialState);
    render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("Expires justLoaded", async () => {
    await waitFor(
      () => expect(mockedStore.getActions()).toEqual([expireJustLoaded()]),
      { timeout: 2100 },
    );
  });
});

describe("When not logged in and not just loaded", () => {
  let mockedStore;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        loading: "success",
        justLoaded: false,
        openFiles: [[]],
        focussedFileIndices: [0],
      },
      auth: {},
    };
    mockedStore = mockStore(initialState);
    render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("Login prompt shown", async () => {
    await waitFor(() => expect(showLoginPrompt).toHaveBeenCalled(), {
      timeout: 2100,
    });
  });

  test("Dispatches save prompt shown action", async () => {
    await waitFor(
      () => expect(mockedStore.getActions()).toEqual([setHasShownSavePrompt()]),
      { timeout: 2100 },
    );
  });

  test("Project saved in localStorage", async () => {
    await waitFor(
      () =>
        expect(localStorage.getItem("hello-world-project")).toEqual(
          JSON.stringify(project),
        ),
      { timeout: 2100 },
    );
  });
});

describe("When not logged in and has been prompted to login to save", () => {
  let mockedStore;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        loading: "success",
        justLoaded: false,
        hasShownSavePrompt: true,
        openFiles: [[]],
        focussedFileIndices: [0],
      },
      auth: {},
    };
    mockedStore = mockStore(initialState);
    render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("Login prompt shown", async () => {
    jest.runAllTimers();
    await waitFor(() => expect(showLoginPrompt).not.toHaveBeenCalled(), {
      timeout: 2100,
    });
  });

  test("Project saved in localStorage", async () => {
    await waitFor(
      () =>
        expect(localStorage.getItem("hello-world-project")).toEqual(
          JSON.stringify(project),
        ),
      { timeout: 2100 },
    );
  });
});

describe("When logged in and user does not own project and just loaded", () => {
  let mockedStore;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project,
        loading: "success",
        justLoaded: true,
        openFiles: [[]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user2,
      },
    };
    mockedStore = mockStore(initialState);
    render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("Expires justLoaded", async () => {
    await waitFor(
      () => expect(mockedStore.getActions()).toEqual([expireJustLoaded()]),
      { timeout: 2100 },
    );
  });
});

describe("When logged in and user does not own project and not just loaded", () => {
  let mockedStore;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project,
        loading: "success",
        justLoaded: false,
        openFiles: [[]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user2,
      },
    };
    mockedStore = mockStore(initialState);
    render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("Save prompt shown", async () => {
    await waitFor(() => expect(showSavePrompt).toHaveBeenCalled(), {
      timeout: 2100,
    });
  });

  test("Dispatches save prompt shown action", async () => {
    await waitFor(
      () => expect(mockedStore.getActions()).toEqual([setHasShownSavePrompt()]),
      { timeout: 2100 },
    );
  });

  test("Project saved in localStorage", async () => {
    await waitFor(
      () =>
        expect(localStorage.getItem("hello-world-project")).toEqual(
          JSON.stringify(project),
        ),
      { timeout: 2100 },
    );
  });
});

describe("When logged in and user does not own project and prompted to save", () => {
  let mockedStore;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project,
        loading: "success",
        justLoaded: false,
        hasShownSavePrompt: true,
        openFiles: [[]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user2,
      },
    };
    mockedStore = mockStore(initialState);
    render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("Save prompt not shown again", async () => {
    jest.runAllTimers();
    await waitFor(() => expect(showSavePrompt).not.toHaveBeenCalled(), {
      timeout: 2100,
    });
  });

  test("Project saved in localStorage", async () => {
    await waitFor(
      () =>
        expect(localStorage.getItem("hello-world-project")).toEqual(
          JSON.stringify(project),
        ),
      { timeout: 2100 },
    );
  });
});

describe("When logged in and user does not own project and awaiting save", () => {
  let mockedStore;
  let remixProject;
  let remixAction;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project,
        loading: "success",
        openFiles: [[]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user2,
      },
    };
    mockedStore = mockStore(initialState);
    localStorage.setItem("awaitingSave", "true");
    remixAction = { type: "REMIX_PROJECT" };
    remixProject = jest.fn(() => remixAction);
    syncProject.mockImplementationOnce(jest.fn((_) => remixProject));
    render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("Project remixed and saved to database", async () => {
    await waitFor(
      () =>
        expect(remixProject).toHaveBeenCalledWith({
          project,
          accessToken: user2.access_token,
        }),
      { timeout: 2100 },
    );
    expect(mockedStore.getActions()[0]).toEqual(remixAction);
  });
});

describe("When logged in and project has no identifier and awaiting save", () => {
  let mockedStore;
  let saveProject;
  let saveAction;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: { ...project, identifier: null },
        loading: "success",
        openFiles: [[]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user2,
      },
    };
    mockedStore = mockStore(initialState);
    localStorage.setItem("awaitingSave", "true");
    saveAction = { type: "SAVE_PROJECT" };
    saveProject = jest.fn(() => saveAction);
    syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
    render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("Project saved to database", async () => {
    await waitFor(
      () =>
        expect(saveProject).toHaveBeenCalledWith({
          project: { ...project, identifier: null },
          accessToken: user2.access_token,
          autosave: false,
        }),
      { timeout: 2100 },
    );
    expect(mockedStore.getActions()[0]).toEqual(saveAction);
  });
});

describe("When logged in and user owns project", () => {
  let mockedStore;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project,
        loading: "success",
        openFiles: [[]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user1,
      },
    };
    mockedStore = mockStore(initialState);
    render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );
  });

  test("Project autosaved to database", async () => {
    const saveAction = { type: "SAVE_PROJECT" };
    const saveProject = jest.fn(() => saveAction);
    syncProject.mockImplementationOnce(jest.fn((_) => saveProject));
    await waitFor(
      () =>
        expect(saveProject).toHaveBeenCalledWith({
          project,
          accessToken: user1.access_token,
          autosave: true,
        }),
      { timeout: 2100 },
    );
    expect(mockedStore.getActions()[0]).toEqual(saveAction);
  });
});

test("Successful manual save prompts project saved message", async () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [],
      },
      openFiles: [[]],
      focussedFileIndices: [0],
      saving: "success",
      lastSaveAutosave: false,
    },
    auth: {},
  };
  const mockedStore = mockStore(initialState);
  render(
    <Provider store={mockedStore}>
      <MemoryRouter>
        <div id="app">
          <Project />
        </div>
      </MemoryRouter>
    </Provider>,
  );
  await waitFor(() => expect(showSavedMessage).toHaveBeenCalled());
});

// TODO: Write test for successful autosave not prompting the project saved message as per the above

describe("When not logged in and falling on default container width", () => {
  test("Shows bottom drag bar with expected params", () => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        openFiles: [["main.py"]],
        focussedFileIndices: [0],
      },
      auth: {},
    };
    const mockedStore = mockStore(initialState);
    const { getByTestId } = render(
      <Provider store={mockedStore}>
        <MemoryRouter>
          <div id="app">
            <Project />
          </div>
        </MemoryRouter>
      </Provider>,
    );

    const container = getByTestId("proj-editor-container");
    expect(container).toHaveStyle({
      "min-width": "25%",
      "max-width": "100%",
      width: "100%",
      height: "50%",
    });

    expect(
      container.getElementsByClassName("resizable-with-handle__handle--bottom")
        .length,
    ).toBe(1);
  });
});
