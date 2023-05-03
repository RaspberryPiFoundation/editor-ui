import configureStore from 'redux-mock-store';
import { render } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import HtmlRunner from "./HtmlRunner";
import { codeRunHandled } from '../../EditorSlice';

const indexPage = { name: 'index', extension: 'html', content: '<p>hello world</p>' }
const anotherHTMLPage = { name: 'amazing', extension: 'html', content: '<p>My amazing page</p>'}
const stylesheet = { name: 'styles', extension: 'css', content: 'p {color: red}'}

describe('When page first loaded', () => {

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [indexPage]
        },
        focussedFileIndices: [0],
        openFiles: [['index.html']],
        justLoaded: true,
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><HtmlRunner /></Provider>);
  })

  test('Runs HTML code', () => {
    expect(Blob).toHaveBeenCalledWith(['<p>hello world</p>'], {type: 'text/html'})
  })
})

describe('When focussed on another HTML file', () => {

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [indexPage, anotherHTMLPage]
        },
        focussedFileIndices: [1],
        openFiles: [['index.html', 'amazing.html']]
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><HtmlRunner /></Provider>);
  })

  test('Shows page related to focussed file', () => {
    expect(Blob).toHaveBeenCalledWith(['<p>My amazing page</p>'], {type: 'text/html'})
  })
})

describe('When focussed on CSS file', () => {
  let store;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [indexPage, stylesheet]
        },
        focussedFileIndices: [1],
        openFiles: [['index.html', 'styles.css']]
      }
    }
    store = mockStore(initialState);
    render(<Provider store={store}><HtmlRunner /></Provider>);
  })

  test('Runs HTML code', () => {
    expect(Blob).toHaveBeenCalledWith(['<p>hello world</p>'], {type: 'text/html'})
  })
})

describe('When run button clicked', () => {
  let store;

  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        project: {
          components: [indexPage]
        },
        focussedFileIndices: [0],
        openFiles: [['index.html']],
        codeRunTriggered: true
      },
    }
    store = mockStore(initialState);
    render(<Provider store={store}><HtmlRunner /></Provider>);
  })

  test('Runs HTML code', () => {
    expect(Blob).toHaveBeenCalledWith(['<p>hello world</p>'], {type: 'text/html'})
  })

  test('Dispatches action to end code run', () => {
    expect(store.getActions()).toEqual(expect.arrayContaining([codeRunHandled()]))
  })
})
