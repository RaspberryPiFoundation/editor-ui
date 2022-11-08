import React from "react";
import { fireEvent, render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import FileMenu from './FileMenu'
import { SettingsContext } from '../../../settings'

describe("with file item", () => {
  let getByRole;
  let queryByRole;

  beforeEach(() => {
    const mockStore = configureStore([])
    const initialState = {
      editor: {
        project: {
          components: [],
          imageList: []
        },
        isEmbedded: false,
        renameFileModalShowing: false,
        modals: {},
      }
    }
    const store = mockStore(initialState)
    ({queryByText} = render(
      <Provider store={store}>
        <SettingsContext.Provider value={{ theme: 'dark', fontSize: 'small' }}>
          <MemoryRouter><div id="app">
            <FileMenu fileKey={0} name={'main'} ext={'file.py'} />
          </div></MemoryRouter>
        </SettingsContext.Provider>
      </Provider>
    ))
  })

  test("Clicking button makes menu content appear", () => {
    const button = getByRole('link', { expanded: false })
    fireEvent.click(button)
    expect(queryByRole('menu')).not.toBeNull()
  })
})