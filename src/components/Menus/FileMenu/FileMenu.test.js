import { fireEvent, getByText, render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import FileMenu from './FileMenu'
import { showRenameFileModal } from '../../Editor/EditorSlice'
import { SettingsContext } from '../../../settings'

describe("with file item", () => {
  let getByRole;
  let queryByRole;
  let getByText;
  let store;

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
    store = mockStore(initialState);
    ({getByRole, queryByRole, getByText} = render(
      <MemoryRouter initialEntries={['/']}>
        <Provider store={store}>
          <SettingsContext.Provider value={{ theme: 'dark', fontSize: 'small' }}>
            <div id="app">
              <FileMenu fileKey={0} name={'main'} ext={'py'} />
            </div>
          </SettingsContext.Provider>
        </Provider>
      </MemoryRouter>
    ))
  })

  test("Menu is not visible initially", () => {
    expect(queryByRole('menu')).toBeNull()
  })

  test("Clicking button makes menu content appear", () => {
    const button = getByRole('button', { expanded: false })
    fireEvent.click(button)
    expect(queryByRole('menu')).not.toBeNull()
  })

  test("All file functions are listed", () => {
    const button = getByRole('button', { expanded: false })
    fireEvent.click(button)
    expect(getByText('filePane.fileMenu.renameItem')).not.toBeNull()
  })

  test("Clicking rename dispatches modal show with file details", () => {
    const menuButton = getByRole('button', { expanded: false })
    fireEvent.click(menuButton)
    const renameButton = getByText('filePane.fileMenu.renameItem')
    fireEvent.click(renameButton)
    const expectedActions = [
      showRenameFileModal({fileKey: 0, ext: "py", name: "main"})
    ]
    expect(store.getActions()).toEqual(expectedActions);
  })

})