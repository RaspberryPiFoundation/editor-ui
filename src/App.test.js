import App from './App';
import store from './app/store'
import { Provider } from 'react-redux'
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Cookies, CookiesProvider } from 'react-cookie';
import configureStore from 'redux-mock-store';
import { showSavedMessage } from './utils/Notifications';
import { saveProject } from './components/Editor/EditorSlice';

jest.mock('./utils/Notifications')
// jest.mock('./components/Editor/EditorSlice')

describe('Browser prefers light mode', () => {
  let cookies;

  beforeEach(() => {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })

    cookies = new Cookies()
  })

  test('Light mode class name added if no cookie', () => {
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(appContainer.container.querySelector('#app')).toHaveClass("--light")
  })

  test('Dark mode class name added if cookie specifies dark theme', () => {
    cookies.set('theme', 'dark')
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(appContainer.container.querySelector('#app')).toHaveClass("--dark")
  })

  afterEach(() => {
    act(() => cookies.remove('theme'))
  })
})

describe('Browser prefers dark mode', () => {

  let cookies;

  beforeEach(() => {
    window.matchMedia = (query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })
    cookies = new Cookies();
  })

  test('Dark mode class name added if no cookie', () => {
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(appContainer.container.querySelector('#app')).toHaveClass("--dark")
  })

  test('Light mode class name added if cookie specifies light theme', () => {
    cookies.set('theme', 'light')
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(appContainer.container.querySelector('#app')).toHaveClass("--light")
  })

  afterEach(() => {
    act(() => cookies.remove('theme'))
  })
})

describe("When selecting the font size", ()=>{

  let cookies;

  beforeEach(() => {
    cookies = new Cookies()
  })
  test("Cookie not set defaults css class to small", () => {
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(appContainer.container.querySelector('#app')).toHaveClass("font-size-small")
  })

  test("Cookie set to large sets correct css class on app", () => {
    cookies.set('fontSize', 'large')
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(appContainer.container.querySelector('#app')).toHaveClass("font-size-large")
    
  })

  test("Cookie set to medium sets correct css class on app", () => {
    cookies.set('fontSize', 'medium')
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(appContainer.container.querySelector('#app')).toHaveClass("font-size-medium")
    
  })

  test("Cookie set to small sets correct css class on app", () => {
    cookies.set('fontSize', 'small')
    const appContainer = render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(appContainer.container.querySelector('#app')).toHaveClass("font-size-small")
  })
})

describe('Beta banner', () => {
  let cookies

  beforeEach(() => {
    cookies = new Cookies()
  })

  test('Renders beta banner if betaBannerDismissed cookie not set', () => {
    render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(screen.queryByText('betaBanner.message')).toBeInTheDocument()
  })

  test('Does not render beta banner if betaBannerDismissedCookie is true', () => {
    cookies.set('betaBannerDismissed', 'true')
    render(
      <CookiesProvider cookies={cookies}>
        <Provider store={store}>
          <App />
        </Provider>
      </CookiesProvider>
    )
    expect(screen.queryByText('betaBanner.message')).not.toBeInTheDocument()
  })

  afterEach(() => {
    act(() => cookies.remove('betaBannerDismissed'))
  })
})

test('Successful manual save prompts project saved message', async () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        saving: 'success',
        lastSaveAutosaved: false
      },
      auth: {}
    }
    const mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><App/></Provider>);
    await waitFor(() => expect(showSavedMessage).toHaveBeenCalled())
})

test('Successful autosave does not prompt project saved message', async () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        saving: 'success',
        lastSaveAutosaved: true
      },
      auth: {}
    }
    const mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><App/></Provider>);
    await waitFor(() => expect(showSavedMessage).not.toHaveBeenCalled())
})

describe('When not logged in', () => {
  const project = {
    name: 'hello world',
    project_type: 'python',
    identifier: 'hello-world-project',
    components: [
      {
        name: 'main',
        extension: 'py',
        content: '# hello'
      }
    ]
  }
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: project,
        projectLoaded: 'success'
      },
      auth: {
        user: null
      }
    }
    const mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><App/></Provider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Project saved in localStorage', async () => {
    await waitFor(() => expect(localStorage.getItem('hello-world-project')).toEqual(JSON.stringify(project)), {timeout: 2100})
  })
})

describe('When logged in and user does not own project', () => {
  const project = {
    name: 'hello world',
    project_type: 'python',
    identifier: 'hello-world-project',
    components: [
      {
        name: 'main',
        extension: 'py',
        content: '# hello'
      }
    ],
    user_id: 'another_user'
  }
  const user = {
    profile: {
      user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
    }
  }

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project,
        projectLoaded: 'success'
      },
      auth: {user}
    }
    const mockedStore = mockStore(initialState);
    render(<Provider store={mockedStore}><App/></Provider>);
  })

  afterEach(() => {
    localStorage.clear()
  })

  test('Project saved in localStorage', async () => {
    await waitFor(() => expect(localStorage.getItem('hello-world-project')).toEqual(JSON.stringify(project)), {timeout: 2100})
  })

})

// describe('When logged in and user owns project', () => {
//   const project = {
//     name: 'hello world',
//     project_type: 'python',
//     identifier: 'hello-world-project',
//     components: [
//       {
//         name: 'main',
//         extension: 'py',
//         content: '# hello'
//       }
//     ],
//     user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
//   }
//   const user = {
//     profile: {
//       user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
//     }
//   }

//   beforeEach(() => {
//     const middlewares = []
//     const mockStore = configureStore(middlewares)
//     const initialState = {
//       editor: {
//         project,
//         projectLoaded: 'success'
//       },
//       auth: {user}
//     }
//     const mockedStore = mockStore(initialState);
//     render(<Provider store={mockedStore}><App/></Provider>);
//   })

//   afterEach(() => {
//     localStorage.clear()
//   })

//   // test('Project autosaved to database', async () => {
//   //   const saveAction = {type: 'SAVE_PROJECT' }
//   //   // saveProject.mockImplementationOnce(() => (saveAction))
//   //   await waitFor(() => expect(saveProject).toHaveBeenCalledWith({project, user, autosave: true}), {timeout: 2100})
//   //   // expect(store.getActions()[0]).toEqual(saveAction)
//   // })
// })
