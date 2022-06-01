import App from './App';
import store from './app/store'
import { Provider } from 'react-redux'
import React from 'react';
import { render } from '@testing-library/react';

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

test('App renders without crashing', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
    );
});

test('Dark mode class name added if browser prefers dark mode', () => {
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

  const appContainer = render(
    <Provider store={store}>
      <App />
    </Provider>
  )

  expect(appContainer.container.querySelector('#app')).toHaveClass("--dark")
})

test('Light mode class name added if browser prefers light mode', () => {
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

  const appContainer = render(
    <Provider store={store}>
      <App />
    </Provider>
  )
  
  expect(appContainer.container.querySelector('#app')).toHaveClass("--light")
})
