import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import Stopwatch from "./Stopwatch";

const middlewares = []
const mockStore = configureStore(middlewares)
const initialState = {
  editor: {
    codeRunTriggered: false
  },
}
const store = mockStore(initialState);
Sk.sense_hat={
  mz_criteria: {}
}

test("Stopwatch renders in form mm:ss", () =>{
  const { getAllByText } = render(<Provider store = {store}><Stopwatch /></Provider>)
  expect(getAllByText("00")).toHaveLength(2)
})
