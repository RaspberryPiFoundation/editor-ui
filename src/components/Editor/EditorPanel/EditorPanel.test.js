import configureStore from 'redux-mock-store'
import { Provider } from "react-redux"
import { SettingsContext } from "../../../settings"
import { render } from '@testing-library/react'
import EditorPanel from './EditorPanel'

describe('When error is set', () => {

  let editorContainer
  
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [
            {name: 'main', extension: 'py', content: ''}
          ]
        }
      }
    }
    const store = mockStore(initialState);
    editorContainer = render(
      <Provider store={store}>
        <SettingsContext.Provider value={{ theme: 'dark', fontSize: 'myFontSize' }}>
          <EditorPanel fileName='main' extension='py'/>
        </SettingsContext.Provider>
      </Provider>
    )
  })

  test('Font size class is set correctly', () => {
    const editor = editorContainer.container.querySelector('.editor')
    expect(editor).toHaveClass("editor--myFontSize")
  })
})
