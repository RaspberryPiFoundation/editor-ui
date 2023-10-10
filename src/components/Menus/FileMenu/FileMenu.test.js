import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import FileMenu from "./FileMenu";
import { showRenameFileModal } from "../../../redux/EditorSlice";
import { SettingsContext } from "../../../utils/settings";

describe("with file item", () => {
  let store;

  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {
      editor: {
        project: {
          components: [],
          imageList: [],
        },
        isEmbedded: false,
        renameFileModalShowing: false,
        modals: {},
      },
    };
    store = mockStore(initialState);
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Provider store={store}>
          <SettingsContext.Provider
            value={{ theme: "dark", fontSize: "small" }}
          >
            <div id="app">
              <FileMenu fileKey={0} name={"file1"} ext={"py"} />
            </div>
          </SettingsContext.Provider>
        </Provider>
      </MemoryRouter>,
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

  test("All file functions are listed", () => {
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.getByText("filePanel.fileMenu.renameItem")).not.toBeNull();
  });

  test("Clicking rename dispatches modal show with file details", () => {
    const menuButton = screen.getByRole("button");
    fireEvent.click(menuButton);
    const renameButton = screen.getByText("filePanel.fileMenu.renameItem");
    fireEvent.click(renameButton);
    const expectedActions = [
      showRenameFileModal({ fileKey: 0, ext: "py", name: "file1" }),
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
