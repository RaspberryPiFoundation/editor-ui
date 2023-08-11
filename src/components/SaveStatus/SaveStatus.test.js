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
let saveStatus;

describe("With a save button", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: project,
        loading: "success",
        lastSavedTime: Date.now(),
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <SaveStatus />
      </Provider>,
    );
    saveStatus = screen.queryByText("saveStatus.saved now");
  });

  test("Renders save button", () => {
    expect(saveStatus).toBeInTheDocument();
  });
});
