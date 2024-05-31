import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import userEvent from "@testing-library/user-event";

import ProjectName from "./ProjectName";
import { updateProjectName } from "../../redux/EditorSlice";

const project = {
  identifier: "hello-world-project",
  name: "Hello world",
  user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
};

let store;
let editButton;
let inputField;

describe("With a label", () => {
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
        <ProjectName showLabel={true} />
      </Provider>,
    );
    editButton = screen.getByLabelText("header.renameProject");
    inputField = screen.getByRole("textbox");
  });

  test("Project type label shown", () => {
    expect(screen.getByText("projectName.label")).toBeInTheDocument();
  });
});

describe("With a webComponent=true", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <ProjectName showLabel={true} editable={false} />
      </Provider>,
    );
  });

  test("Contains hidden project name heading", () => {
    expect(screen.queryByRole("heading")).toHaveTextContent(project.name);
  });

  test("Shows project name", () => {
    expect(screen.queryAllByText(project.name)[1]).toBeInTheDocument();
  });

  test("Edit field not shown", () => {
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  test("Edit button not shown", () => {
    expect(
      screen.queryByLabelText("header.renameProject"),
    ).not.toBeInTheDocument();
  });
});

describe("With no label", () => {
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
        <ProjectName />
      </Provider>,
    );
    editButton = screen.getByLabelText("header.renameProject");
    inputField = screen.getByRole("textbox");
  });

  test("Project name input field is disabled initially", () => {
    expect(screen.queryByRole("textbox")).toBeDisabled();
  });

  test("Edit button shown initially", () => {
    expect(editButton).toBeInTheDocument();
  });

  describe("When edit button clicked", () => {
    beforeEach(() => {
      fireEvent.click(editButton);
    });

    test("Input field is enabled", () => {
      expect(screen.queryByRole("textbox")).not.toBeDisabled();
    });

    test("Focus transferred to input field", () => {
      expect(screen.queryByRole("textbox")).toHaveFocus();
    });

    test("Tick button shown", () => {
      expect(screen.getByLabelText("header.renameSave")).toBeInTheDocument();
    });
  });

  describe("When input field loses focus", () => {
    beforeEach(() => {
      fireEvent.click(editButton);
      userEvent.click(document.body);
    });

    test("Does not update project name", () => {
      expect(store.getActions()).toEqual([]);
    });

    test("Disables input field", async () => {
      await waitFor(() => expect(inputField).toBeDisabled());
    });

    test("Switches to edit button", () => {
      expect(editButton).toBeInTheDocument();
    });
  });

  describe("When Enter is pressed", () => {
    beforeEach(() => {
      fireEvent.click(editButton);
      fireEvent.keyDown(inputField, { key: "Enter" });
    });

    test("Updates project name", () => {
      expect(store.getActions()).toEqual([updateProjectName(project.name)]);
    });

    test("Disables input field", async () => {
      await waitFor(() => expect(inputField).toBeDisabled());
    });

    test("Switches to edit button", () => {
      expect(editButton).toBeInTheDocument();
    });
  });

  describe("When tick button clicked", () => {
    beforeEach(() => {
      fireEvent.click(editButton);
      const tickButton = screen.getByTitle("header.renameSave");
      fireEvent.click(tickButton);
    });

    test("Updates project name", () => {
      expect(store.getActions()).toEqual([updateProjectName(project.name)]);
    });

    test("Disables input field", async () => {
      await waitFor(() => expect(inputField).toBeDisabled());
    });

    test("Switches to edit button", () => {
      expect(editButton).toBeInTheDocument();
    });
  });

  describe("When Escape is pressed", () => {
    beforeEach(() => {
      fireEvent.click(editButton);
      fireEvent.keyDown(inputField, { key: "Escape" });
    });

    test("Does not update project name", () => {
      expect(store.getActions()).toEqual([]);
    });

    test("Disables input field", async () => {
      await waitFor(() => expect(inputField).toBeDisabled());
    });

    test("Switches to edit button", () => {
      expect(editButton).toBeInTheDocument();
    });
  });
});
