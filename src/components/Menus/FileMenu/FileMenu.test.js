import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import { fireEvent, render } from '@testing-library/react'

import FileMenu from './FileMenu'
import { SettingsContext } from '../../../settings'

const middlewares = []
const mockStore = configureStore(middlewares)

describe("with file item", () => {
  let getByRole;
  let queryByRole;
  let store;

  beforeEach(() => {
    const initialState = {
      editor: {
        project: {
          components: []
        },
        isEmbedded: false,
        renameFileModalShowing: false,
        modals: {},
      },
      auth: {
        user: null 
      }
    }
    store = mockStore(initialState)
    ({ getByRole, queryByRole } = render(
      <Provider store={store}>
        {/* <SettingsContext.Provider value={{ theme: 'dark', fontSize: 'small' }}> */}
          <MemoryRouter><div id="app">
            <FileMenu fileKey={0} name={'main'} ext={'file.py'} />
          </div></MemoryRouter>
        {/* </SettingsContext.Provider> */}
      </Provider>
    ))
  })

  test("Clicking button makes menu content appear", () => {
    const button = getByRole('link', { expanded: false })
    fireEvent.click(button)
    expect(queryByRole('menu')).not.toBeNull()
  })
})