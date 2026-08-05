import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ProjectInfo from "./ProjectInfo";

const project = {
  identifier: "hello-world-project",
  name: "Hello world",
  user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  project_type: "html",
};

let store;

beforeEach(() => {
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: project,
    },
  };
  store = mockStore(initialState);
  render(
    <Provider store={store}>
      <ProjectInfo />
    </Provider>,
  );
});

test("Project type label shown", () => {
  expect(
    screen.getByText("projectsPanel.projectTypeLabel"),
  ).toBeInTheDocument();
});

test("Project type shown", () => {
  expect(screen.getByText("projectTypes.html")).toBeInTheDocument();
});
