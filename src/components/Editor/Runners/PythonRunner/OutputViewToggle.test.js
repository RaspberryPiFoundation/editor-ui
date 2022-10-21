import React from "react";
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import OutputViewToggle from "./OutputViewToggle";
import { setIsSplitView } from "../../EditorSlice";

describe('When in tabbed view', () => {
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        isSplitView: false,
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><OutputViewToggle /></Provider>);
  })

  test('Tabbed view button is active', () => {
    expect(screen.getAllByRole('button')[0]).toHaveClass('output-view-toggle__button--tabbed output-view-toggle__button--active')
  })

  test('Split view button is not active', () => {
    expect(screen.getAllByRole('button')[1]).toHaveClass('output-view-toggle__button--split')
    expect(screen.getAllByRole('button')[1]).not.toHaveClass('output-view-toggle__button--active')
  })
})

describe('When in split view', () => {
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        isSplitView: true,
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><OutputViewToggle /></Provider>);
  })

  test('Split view button is active', () => {
    expect(screen.getAllByRole('button')[1]).toHaveClass('output-view-toggle__button--split output-view-toggle__button--active')
  })

  test('Tabbed view button is not active', () => {
    expect(screen.getAllByRole('button')[0]).toHaveClass('output-view-toggle__button--tabbed')
    expect(screen.getAllByRole('button')[0]).not.toHaveClass('output-view-toggle__button--active')
  })
})

test('Clicking tabbed view icon switches to tabbed view', () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {}
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><OutputViewToggle /></Provider>);
    fireEvent.click(screen.getAllByRole('button')[0])
    const expectedActions = [setIsSplitView(false)]
    expect(store.getActions()).toEqual(expectedActions);
})

test('Clicking split view icon switches to tabbed view', () => {
  const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {}
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><OutputViewToggle /></Provider>);
    fireEvent.click(screen.getAllByRole('button')[1])
    const expectedActions = [setIsSplitView(true)]
    expect(store.getActions()).toEqual(expectedActions);
})

describe('When in a code run is triggered', () => {
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        codeRunTriggered: true,
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><OutputViewToggle /></Provider>);
  })

  test('Tabbed view button is disabled', () => {
    expect(screen.getAllByRole('button')[0]).toHaveClass('output-view-toggle__button--tabbed')
    expect(screen.getAllByRole('button')[0]).toBeDisabled()
  })

  test('Split view button is disabled', () => {
    expect(screen.getAllByRole('button')[1]).toHaveClass('output-view-toggle__button--split')
    expect(screen.getAllByRole('button')[1]).toBeDisabled()
  })
})

describe('When in a draw run is triggered', () => {
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        drawTriggered: true,
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><OutputViewToggle /></Provider>);
  })

  test('Tabbed view button is disabled', () => {
    expect(screen.getAllByRole('button')[0]).toHaveClass('output-view-toggle__button--tabbed')
    expect(screen.getAllByRole('button')[0]).toBeDisabled()
  })

  test('Split view button is disabled', () => {
    expect(screen.getAllByRole('button')[1]).toHaveClass('output-view-toggle__button--split')
    expect(screen.getAllByRole('button')[1]).toBeDisabled()
  })
})

describe('When in neither a code run nor a draw run is triggered', () => {
  beforeEach(() => {
    const middlewares = []
    const mockStore = configureStore(middlewares)
    const initialState = {
      editor: {
        codeRunTriggered:false,
        drawTriggered: false,
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><OutputViewToggle /></Provider>);
  })

  test('Tabbed view button is enabled', () => {
    expect(screen.getAllByRole('button')[0]).toHaveClass('output-view-toggle__button--tabbed')
    expect(screen.getAllByRole('button')[0]).not.toBeDisabled()
  })

  test('Split view button is enabled', () => {
    expect(screen.getAllByRole('button')[1]).toHaveClass('output-view-toggle__button--split')
    expect(screen.getAllByRole('button')[1]).not.toBeDisabled()
  })
})
