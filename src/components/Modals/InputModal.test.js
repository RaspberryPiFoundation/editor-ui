import React from "react";
import configureStore from 'redux-mock-store';
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import InputModal from "./InputModal";

let inputBox

beforeEach(() => {
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      nameError: ''
    }
  }
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <div id='app'>
        <InputModal
          isOpen={true}
          inputs={[
            {
              label: 'input',
              helpText: 'help me',
              value: 'my amazing default'
            }
          ]}
        />
      </div>
    </Provider>
  )
  inputBox = screen.getByLabelText(/input/)
})

test('Renders help text', () => {
  expect(screen.queryByText('help me')).toBeInTheDocument()

test('Input renders with default value', () => {
  expect(inputBox).toHaveValue('my amazing default')
})
