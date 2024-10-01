import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";
import MobileProjectBar from "./MobileProjectBar";

const project = {
  identifier: "hello-world-project",
  name: "Hello world",
  user_id: "a19dc471-c857-450b-a974-6098acb1cef1",
};

const user = {
  access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

const initialState = {
  editor: {
    project: {},
    loading: "idle",
  },
  auth: {
    user: {},
  },
};

const renderMobileProjectBar = (state) => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const store = mockStore({ ...initialState, ...state });
  render(
    <Provider store={store}>
      <MemoryRouter>
        <MobileProjectBar />
      </MemoryRouter>
    </Provider>,
  );
};

describe("When logged in and user owns project", () => {
  beforeEach(() => {
    renderMobileProjectBar({
      editor: { project, loading: "success" },
      auth: { user },
    });
  });

  test("Project name is shown", () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });
});

describe("When logged out", () => {
  beforeEach(() => {
    renderMobileProjectBar({});
  });

  test("No saved info", () => {
    expect(screen.queryByText("saveButton.saved")).not.toBeInTheDocument();
  });
});

describe("When read only", () => {
  beforeEach(() => {
    renderMobileProjectBar({
      editor: { project, loading: "success", readOnly: true },
      auth: { user },
    });
  });

  test("No saved info", () => {
    expect(screen.queryByText("saveButton.saved")).not.toBeInTheDocument();
  });
});
