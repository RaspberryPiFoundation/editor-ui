import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from "react-router-dom";

import FilePane from "./FilePane";

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
    expect(queryByText("Project Files")).not.toBeNull()
  })

  test("No project images section", () => {
    expect(queryByText("Image Gallery")).toBeNull()
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
    expect(queryByText("Project Files")).not.toBeNull()
  })

  test("Renders project images section", () => {
    expect(queryByText("Image Gallery")).not.toBeNull()
  })
})


