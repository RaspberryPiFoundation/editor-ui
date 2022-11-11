import App from './App';
import store from './app/store'
import { Provider } from 'react-redux'
import React from 'react';
import { render } from '@testing-library/react';
import { Cookies, CookiesProvider } from 'react-cookie';

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
    cookies.remove("theme")
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
    cookies.remove("theme")
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
