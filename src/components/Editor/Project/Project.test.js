import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Project from "./Project";
import { showSavedMessage } from "../../../utils/Notifications";
import { MemoryRouter } from "react-router-dom";

import "../../../consoleMock";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

jest.mock("../../../utils/Notifications");

jest.useFakeTimers();

const user1 = {
  access_token: "myAccessToken",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
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

test("Renders sidebar with correct options if withSidebar is true", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [],
      },
      openFiles: [[]],
      focussedFileIndices: [0],
      webComponent: false,
    },
    auth: {},
    instructions: {},
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <div id="app">
          <Project withSidebar={true} sidebarOptions={["settings"]} />
        </div>
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.queryByTitle("sidebar.settings")).toBeInTheDocument();
});

test("Renders without sidebar if withSidebar is false", () => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [],
      },
      openFiles: [[]],
      focussedFileIndices: [0],
      webComponent: false,
    },
    auth: {},
    instructions: {},
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Project withSidebar={false} />
      </MemoryRouter>
    </Provider>,
  );
  expect(screen.queryByTitle("sidebar.expand")).not.toBeInTheDocument();
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
        webComponent: false,
      },
      auth: {},
      instructions: {},
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
      webComponent: false,
    },
    auth: {},
    instructions: {},
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
