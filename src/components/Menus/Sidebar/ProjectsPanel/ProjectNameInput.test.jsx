import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import { updateProjectName } from "../../../../redux/EditorSlice";
import ProjectNameInput from "./ProjectNameInput";

const projectName = "Hello world";

const renderProjectNameInput = (editable = true) => {
  const mockStore = configureStore([]);
  const store = mockStore({
    editor: {
      project: { name: projectName },
    },
  });

  render(
    <Provider store={store}>
      <ProjectNameInput editable={editable} />
    </Provider>,
  );

  return store;
};

describe("ProjectNameInput", () => {
  test("uses the design-system input in read-only mode initially", () => {
    renderProjectNameInput();

    const input = screen.getByRole("textbox", { name: "projectName.label" });
    expect(input).toHaveClass("rpf-input", "rpf-input-text");
    expect(input).toHaveAttribute("readonly");
    expect(input).toHaveAttribute("tabindex", "-1");
    expect(input).toHaveValue(projectName);
  });

  test("makes the input editable and focuses it from the edit button", () => {
    renderProjectNameInput();

    fireEvent.click(screen.getByLabelText("header.renameProject"));

    const input = screen.getByRole("textbox", { name: "projectName.label" });
    expect(input).not.toHaveAttribute("readonly");
    expect(input).toHaveAttribute("tabindex", "0");
    expect(input).toHaveFocus();
  });

  test("saves the edited name from the save button", () => {
    const store = renderProjectNameInput();
    fireEvent.click(screen.getByLabelText("header.renameProject"));

    const input = screen.getByRole("textbox", { name: "projectName.label" });
    fireEvent.change(input, { target: { value: "Updated project" } });
    fireEvent.click(screen.getByLabelText("header.renameSave"));

    expect(store.getActions()).toEqual([updateProjectName("Updated project")]);
    expect(input).toHaveAttribute("readonly");
  });

  test("stays read-only without an edit button when editing is disabled", () => {
    renderProjectNameInput(false);

    expect(
      screen.getByRole("textbox", { name: "projectName.label" }),
    ).toHaveAttribute("readonly");
    expect(
      screen.queryByLabelText("header.renameProject"),
    ).not.toBeInTheDocument();
  });
});
