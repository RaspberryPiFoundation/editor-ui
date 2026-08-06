import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import SaveStatus from "./SaveStatus";

const project = {
  identifier: "hello-world-project",
  name: "Hello world",
  user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
};

let store;

describe("With a save button", () => {
  beforeEach(() => {
    store = configureStore([])({
      editor: {
        project: project,
        loading: "success",
        lastSavedTime: Date.now(),
      },
    });
    render(
      <Provider store={store}>
        <SaveStatus />
      </Provider>,
    );
  });

  test("Renders save status", () => {
    expect(screen.queryByText("saveStatus.saved now")).toBeInTheDocument();
  });
});
