import React from "react";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import userManager from "../../utils/userManager";
import LoginButton from "./LoginButton";

jest.mock("../../utils/userManager", () => ({
  signinRedirect: jest.fn(),
}));

const project = {
  components: [
    {
      name: "main",
      extension: "py",
      content: 'print("hello world")',
    },
  ],
};
let loginButton;

describe("When accessDeniedData is false", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        modals: {},
      },
      auth: {
        user: null,
      },
    };
    const store = mockStore(initialState);
    render(
      <MemoryRouter initialEntries={["/my_project"]}>
        <Provider store={store}>
          <LoginButton buttonText="Login" />
        </Provider>
      </MemoryRouter>,
    );
    loginButton = screen.queryByText("Login");
  });

  test("Login button shown", () => {
    expect(loginButton).toBeInTheDocument();
  });

  test("Clicking login button signs the user in", () => {
    fireEvent.click(loginButton);
    expect(userManager.signinRedirect).toHaveBeenCalled();
  });

  test("Clicking login button saves the user's project content in local storage", () => {
    fireEvent.click(loginButton);
    expect(localStorage.getItem("project")).toBe(JSON.stringify(project));
  });

  test("Clicking login button saves user's location to local storage", () => {
    fireEvent.click(loginButton);
    expect(localStorage.getItem("location")).toBe("/my_project");
  });
});

describe("When accessDeniedData is true", () => {
  beforeEach(() => {
    project.identifier = "hello-world-project";
    project.projectType = "python";

    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        modals: {
          accessDenied: {
            identifier: project.identifier,
            projectType: project.projectType,
          },
        },
      },
      auth: {
        user: null,
      },
    };
    const store = mockStore(initialState);
    render(
      <MemoryRouter initialEntries={["/hello-world-project"]}>
        <Provider store={store}>
          <LoginButton buttonText="Login" />
        </Provider>
      </MemoryRouter>,
    );
    loginButton = screen.queryByText("Login");
  });

  test("Clicking the login button saves user's location to local storage", () => {
    fireEvent.click(loginButton);
    expect(localStorage.getItem("location")).toBe(
      "/projects/hello-world-project",
    );
  });
});

describe("When loginRedirect is set", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {},
        modals: {},
      },
      auth: {
        user: null,
      },
    };
    const store = mockStore(initialState);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Provider store={store}>
          <LoginButton buttonText="Login" loginRedirect="/some-other-page" />
        </Provider>
      </MemoryRouter>,
    );
    loginButton = screen.queryByText("Login");
  });

  test("Clicking the login button saves loginRedirect location to local storage", () => {
    fireEvent.click(loginButton);
    expect(localStorage.getItem("location")).toBe("/some-other-page");
  });
});

describe("When project is not set", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        modals: {},
      },
      auth: {
        user: null,
      },
    };
    const store = mockStore(initialState);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Provider store={store}>
          <LoginButton buttonText="Login" />
        </Provider>
      </MemoryRouter>,
    );
    loginButton = screen.queryByText("Login");
  });

  test("Clicking the login button doesn't save project to local storage", () => {
    fireEvent.click(loginButton);
    expect(localStorage.getItem("project")).toBeNull();
  });
});

describe("When login button has triggerSave set", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        modals: {},
      },
      auth: {
        user: null,
      },
    };
    const store = mockStore(initialState);
    render(
      <MemoryRouter initialEntries={["/my_project"]}>
        <Provider store={store}>
          <LoginButton buttonText="Login" triggerSave />
        </Provider>
      </MemoryRouter>,
    );
    loginButton = screen.queryByText("Login");
  });

  test("Clicking login button sets 'awaitingSave' in local storage", () => {
    fireEvent.click(loginButton);
    expect(localStorage.getItem("awaitingSave")).toBe("true");
  });
});

describe("When login button does not have triggerSave set", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        modals: {},
      },
      auth: {
        user: null,
      },
    };
    const store = mockStore(initialState);
    render(
      <MemoryRouter initialEntries={["/my_project"]}>
        <Provider store={store}>
          <LoginButton buttonText="Login" />
        </Provider>
      </MemoryRouter>,
    );
    loginButton = screen.queryByText("Login");
  });

  test("Clicking login button does not set 'awaitingSave' in local storage", () => {
    fireEvent.click(loginButton);
    expect(localStorage.getItem("awaitingSave")).toBeNull();
  });
});

afterEach(() => {
  localStorage.clear();
});
