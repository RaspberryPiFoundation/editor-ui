import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import MobileProject from "./MobileProject";
import { showSidebar } from "../../../redux/EditorSlice";

window.HTMLElement.prototype.scrollIntoView = jest.fn();

const middlewares = [];
const mockStore = configureStore(middlewares);

const user = {
  access_token: "myAccessToken",
  profile: {
    user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
  },
};

describe("When code is not running", () => {
  beforeEach(() => {
    const initialState = {
      editor: {
        project: {
          project_type: "python",
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello')",
            },
          ],
          image_list: [],
          user_id: user.profile.user,
        },
        codeRunTriggered: false,
        openFiles: [["main.py"]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MobileProject />
      </Provider>,
    );
  });

  test("renders the code", () => {
    const codeTab = screen.getByText("mobile.code").parentElement;
    expect(codeTab).toHaveClass("react-tabs__tab--selected");
  });
});

describe("When code is running", () => {
  beforeEach(() => {
    const initialState = {
      editor: {
        project: {
          project_type: "python",
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello')",
            },
          ],
          image_list: [],
          user_id: user.profile.user,
        },
        codeRunTriggered: true,
        openFiles: [["main.py"]],
        focussedFileIndices: [0],
      },
      auth: {
        user: user,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MobileProject />
      </Provider>,
    );
  });

  test("renders the output", () => {
    const outputTab = screen.getByText("mobile.output").parentElement;
    expect(outputTab).toHaveClass("react-tabs__tab--selected");
  });
});

describe("When withSidebar is true", () => {
  let store;

  beforeEach(() => {
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello')",
            },
          ],
          image_list: [],
        },
        openFiles: [],
        focussedFileIndices: [],
      },
      auth: {},
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MobileProject withSidebar={true} sidebarOptions={["settings"]} />
      </Provider>,
    );
  });

  test("renders the sidebar open button", () => {
    expect(screen.getByText("mobile.menu")).toBeInTheDocument();
  });

  test("clicking sidebar open button dispatches action to open the sidebar", () => {
    const sidebarOpenButton = screen.getByText("mobile.menu");
    fireEvent.click(sidebarOpenButton);
    expect(store.getActions()).toEqual([showSidebar()]);
  });
});

describe("When sidebar is open", () => {
  beforeEach(() => {
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello')",
            },
          ],
          image_list: [],
        },
        openFiles: [],
        focussedFileIndices: [],
        sidebarShowing: true,
      },
      auth: {},
      instructions: {},
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MobileProject withSidebar={true} sidebarOptions={["settings"]} />
      </Provider>,
    );
  });

  test("Sidebar renders with the correct options", () => {
    expect(screen.queryByTitle("sidebar.settings")).toBeInTheDocument();
  });
});

describe("When withSidebar is false", () => {
  beforeEach(() => {
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello')",
            },
          ],
          image_list: [],
        },
        openFiles: [],
        focussedFileIndices: [],
      },
      auth: {},
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <MobileProject withSidebar={false} />
      </Provider>,
    );
  });

  test("Sidebar open button is not rendered", () => {
    expect(screen.queryByTitle("sidebar.expand")).not.toBeInTheDocument();
  });
});
