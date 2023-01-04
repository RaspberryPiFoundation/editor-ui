import React from "react";
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from "react-router-dom";

import FilePane from "./FilePane";
import { openFile } from "../Editor/EditorSlice";

describe("When no project images", () => {
  let queryByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: []
        },
        isEmbedded: false
      },
      auth: {
        user: null 
      }
    }
    const store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><MemoryRouter><div id="app"><FilePane /></div></MemoryRouter></Provider>))
  })


  test("Renders project files section", () => {
    expect(queryByText("filePane.files")).not.toBeNull()
  })

  test("No project images section", () => {
    expect(queryByText("filePane.images")).toBeNull()
  })
})

describe("When project images", () => {
  let queryByText;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [],
          image_list: [
            {
              filename: "hello_world.png"
            }
          ]
        },
        isEmbedded: false
      },
      auth: {
        user: null 
      }
    }
    const store = mockStore(initialState);
    ({queryByText} = render(<Provider store={store}><MemoryRouter><div id="app"><FilePane /></div></MemoryRouter></Provider>))
  })


  test("Renders project files section", () => {
    expect(queryByText("filePane.files")).not.toBeNull()
  })

  test("Renders project images section", () => {
    expect(queryByText("filePane.images")).not.toBeNull()
  })
})
