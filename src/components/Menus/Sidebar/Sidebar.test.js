import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Sidebar from "./Sidebar";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

beforeEach(() => {
  const mockStore = configureStore([]);
  const initialState = {
    editor: {
      project: {
        components: [],
      },
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <div id="app">
        <Sidebar />
      </div>
    </Provider>,
  );
});

test("File pane closed by default", () => {
  expect(screen.queryByTitle("sidebar.expand")).toBeInTheDocument();
});

test("Clicking expand opens the file pane", () => {
  const expandButton = screen.getByTitle("sidebar.expand");
  fireEvent.click(expandButton);
  expect(screen.queryByText("filePanel.files")).toBeInTheDocument();
});

test("Clicking collapse closes the sidebar panel", () => {
  const expandButton = screen.getByTitle("sidebar.expand");
  fireEvent.click(expandButton);
  const collapseButton = screen.getByTitle("sidebar.collapse");
  fireEvent.click(collapseButton);
  expect(screen.queryByText("filePanel.files")).not.toBeInTheDocument();
});

test("Clicking file button opens file panel", () => {
  const fileButton = screen.getByTitle("sidebar.file");
  fireEvent.click(fileButton);
  expect(screen.queryByText("filePanel.files")).toBeInTheDocument();
});

test("Clicking file button a second time closes file pane", () => {
  const fileButton = screen.getByTitle("sidebar.file");
  fireEvent.click(fileButton);
  fireEvent.click(fileButton);
  expect(screen.queryByText("filePanel.files")).not.toBeInTheDocument();
});
