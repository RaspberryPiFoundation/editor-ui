import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import "../../../consoleMock";

import NewComponentButton from "./NewComponentButton";
import { showNewFileModal } from "../../../redux/EditorSlice";

describe("Testing the new file modal", () => {
  let store;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
            },
          ],
          project_type: "python",
        },
        nameError: "",
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <NewComponentButton />
      </Provider>,
    );
  });

  test("Button renders", () => {
    expect(screen.queryByText("filePanel.newFileButton")).toBeInTheDocument();
  });

  test("Clicking button opens new file modal", () => {
    const button = screen.queryByText("filePanel.newFileButton");
    fireEvent.click(button);
    const expectedActions = [showNewFileModal()];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
