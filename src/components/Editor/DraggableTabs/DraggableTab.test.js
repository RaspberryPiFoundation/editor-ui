import React from "react";
import configureStore from "redux-mock-store";
import { fireEvent, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import DraggableTab from "./DraggableTab";
import DroppableTabList from "./DroppableTabList";
import { DragDropContext } from "@hello-pangea/dnd";
import { setFocussedFileIndex } from "../../../redux/EditorSlice";

describe("when tab is in focus", () => {
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
              content: 'print("hello")',
            },
            {
              name: "a",
              extension: "py",
              content: "# Your code here",
            },
          ],
        },
        openFiles: [["a.py", "main.py", "b.py"]],
        focussedFileIndices: [1],
      },
      auth: {
        user: null,
      },
    };
    store = mockStore(initialState);
    render(
      <Provider store={store}>
        <DragDropContext>
          <DroppableTabList index={0}>
            <DraggableTab panelIndex={0} fileIndex={1}>
              main.py
            </DraggableTab>
          </DroppableTabList>
        </DragDropContext>
      </Provider>,
    );
  });
  test("pressing right arrow key moves focus to right", () => {
    const tab = screen.queryByText("main.py");
    fireEvent.keyDown(tab, { code: "ArrowRight" });
    expect(store.getActions()).toEqual([
      setFocussedFileIndex({ panelIndex: 0, fileIndex: 2 }),
    ]);
  });

  test("pressing left arrow key moves focus to left", () => {
    const tab = screen.queryByText("main.py");
    fireEvent.keyDown(tab, { code: "ArrowLeft" });
    expect(store.getActions()).toEqual([
      setFocussedFileIndex({ panelIndex: 0, fileIndex: 0 }),
    ]);
  });

  test("clicking tab switches focus to it", () => {
    const tab = screen.queryByText("main.py");
    fireEvent.click(tab);
    expect(store.getActions()).toEqual([
      setFocussedFileIndex({ panelIndex: 0, fileIndex: 1 }),
    ]);
  });
});
