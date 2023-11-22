import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import { ProjectListItem } from "./ProjectListItem";

jest.mock("date-fns");

let store;
let project = {
  identifier: "hello-world-project",
  name: "my amazing project",
  updatedAt: Date.now(),
};

beforeEach(() => {
  const mockStore = configureStore([]);
  const initialState = {};
  store = mockStore(initialState);

  render(
    <Provider store={store}>
      <MemoryRouter>
        <ProjectListItem project={project} />
      </MemoryRouter>
    </Provider>,
  );
});

test("Renders project name", () => {
  expect(screen.queryByText(project.name)).toBeInTheDocument();
});

test("Clicking rename button opens rename project modal", () => {
  const renameButtons = screen.queryAllByText("projectList.rename");
  fireEvent.click(renameButtons[0]);
  expect(store.getActions()).toEqual([
    { type: "editor/showRenameProjectModal", payload: project },
  ]);
});

test("Clicking delete button opens delete project modal", () => {
  const deleteButtons = screen.queryAllByText("projectList.delete");
  fireEvent.click(deleteButtons[0]);
  expect(store.getActions()).toEqual([
    { type: "editor/showDeleteProjectModal", payload: project },
  ]);
});
