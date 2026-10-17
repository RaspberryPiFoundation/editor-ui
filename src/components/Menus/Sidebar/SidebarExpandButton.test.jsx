import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import SidebarExpandButton from "./SidebarExpandButton";
import { setSidebarOption } from "../../../redux/EditorSlice";

const renderButton = (editorState = {}, instructionsState = {}, props = {}) => {
  const mockStore = configureStore([]);
  const store = mockStore({
    editor: {
      project: { components: [] },
      ...editorState,
    },
    instructions: instructionsState,
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <SidebarExpandButton {...props} />
      </Provider>,
    ),
  };
};

describe("SidebarExpandButton", () => {
  test("is hidden while the sidebar panel is open", () => {
    renderButton({ selectedSidebarOption: "instructions" });

    expect(
      screen.queryByTitle("sidebar.expandInstructions"),
    ).not.toBeInTheDocument();
  });

  test("is hidden before a sidebar option has been stored", () => {
    renderButton({ instructionsEditable: true });

    expect(
      screen.queryByTitle("sidebar.expandInstructions"),
    ).not.toBeInTheDocument();
  });

  test("is hidden when the project has no instructions to show", () => {
    renderButton({ selectedSidebarOption: null, instructionsEditable: false });

    expect(
      screen.queryByTitle("sidebar.expandInstructions"),
    ).not.toBeInTheDocument();
  });

  test("is shown when the panel is collapsed and instructions are editable", () => {
    renderButton({ selectedSidebarOption: null, instructionsEditable: true });

    expect(
      screen.queryByTitle("sidebar.expandInstructions"),
    ).toBeInTheDocument();
  });

  test("is shown when the panel is collapsed and the project has steps", () => {
    renderButton(
      { selectedSidebarOption: null, instructionsEditable: false },
      { project: { steps: [{ content: "<p>step 0</p>" }] } },
    );

    expect(
      screen.queryByTitle("sidebar.expandInstructions"),
    ).toBeInTheDocument();
  });

  test("opens the instructions panel when clicked", () => {
    const { store } = renderButton({
      selectedSidebarOption: null,
      instructionsEditable: true,
    });

    fireEvent.click(screen.getByTitle("sidebar.expandInstructions"));

    expect(store.getActions()).toEqual([setSidebarOption("instructions")]);
  });
});
