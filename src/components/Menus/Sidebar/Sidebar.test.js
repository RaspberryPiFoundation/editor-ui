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

test("File pane open by default", () => {
  expect(screen.getByRole("heading")).toHaveTextContent("filePane.files");
});

test("Clicking collapse closes the file pane", () => {
  const collapseButton = screen.getByTitle("Sidebar.collapse");
  fireEvent.click(collapseButton);
  expect(screen.queryByText("filePane.files")).not.toBeInTheDocument();
});
