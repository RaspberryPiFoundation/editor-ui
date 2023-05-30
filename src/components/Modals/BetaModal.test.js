import React from "react";
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import BetaModal from "./BetaModal";

const middlewares = []
const mockStore = configureStore(middlewares)

test('Modal rendered when betaModalShowing is true', () => {
  const initialState = {
    editor: {
      betaModalShowing: true
    }
  }
  const store = mockStore(initialState);

  render(<Provider store={store}><div id='app'><BetaModal /></div></Provider>)

  expect(screen.queryByText('betaBanner.modal.heading')).toBeInTheDocument()
})

test('Clicking close dispatches close modal action', () => {
  const initialState = {
    editor: {
      betaModalShowing: true
    }
  }
  const store = mockStore(initialState);

  render(<Provider store={store}><div id='app'><BetaModal /></div></Provider>)

  const closeButton = screen.queryByText('betaBanner.modal.close')
  fireEvent.click(closeButton)
  expect(store.getActions()).toEqual([{type: 'editor/closeBetaModal'}])
})
