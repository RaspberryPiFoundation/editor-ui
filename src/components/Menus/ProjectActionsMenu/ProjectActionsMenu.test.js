import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import ProjectActionsMenu from "./ProjectActionsMenu";
import configureStore from "redux-mock-store";

let store;

beforeEach(() => {
  const mockStore = configureStore([]);
  const initialState = {};
  store = mockStore(initialState);

  render(
    <Provider store={store}>
      <ProjectActionsMenu project={{ name: "my amazing project" }} />
    </Provider>,
  );
});

test("Menu is not visible initially", () => {
  expect(screen.queryByRole("menu")).toBeNull();
});

test("Clicking button makes menu content appear", () => {
  const button = screen.getByRole("button");
  fireEvent.click(button);
  expect(screen.queryByRole("menu")).not.toBeNull();
});

test("Clicking rename option opens the rename project modal", () => {
  const button = screen.getByRole("button");
  fireEvent.click(button);
  const renameOption = screen.getByText("projectList.rename");
  fireEvent.click(renameOption);
  expect(store.getActions()).toEqual([
    {
      type: "editor/showRenameProjectModal",
      payload: { name: "my amazing project" },
    },
  ]);
});

test("Clicking delete option opens the delete project modal", () => {
  const button = screen.getByRole("button");
  fireEvent.click(button);
  const deleteOption = screen.getByText("projectList.delete");
  fireEvent.click(deleteOption);
  expect(store.getActions()).toEqual([
    {
      type: "editor/showDeleteProjectModal",
      payload: { name: "my amazing project" },
    },
  ]);
});
