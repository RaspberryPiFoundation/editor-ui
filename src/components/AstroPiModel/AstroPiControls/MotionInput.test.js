import React from "react";
import { render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import MotionInput from "./MotionInput";
import Sk from 'skulpt';

let container;
let store;
const start_motion_function = jest.fn()
const stop_motion_function = jest.fn()

describe("No motion and code running", () => {
  beforeEach(() => {
    Sk.sense_hat={
      start_motion_callback: start_motion_function,
      stop_motion_callback: stop_motion_function
    }
    const middlewares = []
      const mockStore = configureStore(middlewares)
      const initialState = {
        editor: {
          codeRunTriggered: true
        },
      }
      store = mockStore(initialState);
      container = render(<Provider store={store}><MotionInput defaultValue={false}/></Provider>)
  })
  
  test("Displays checkbox with correct value", () => {
    expect(container.queryByLabelText(/Motion/).checked).toBe(false)
  })
  
  test("Stop motion function has been called", () => {
    expect(stop_motion_function).toHaveBeenCalledTimes(1)
  })
  
  test("Skulpt sense hat motion set to false", () => {
    expect(Sk.sense_hat.motion).toBe(false)
  })
})

describe("Motion and code running", () => {
  beforeEach(() => {
    Sk.sense_hat={
      start_motion_callback: start_motion_function,
      stop_motion_callback: stop_motion_function
    }
    const middlewares = []
      const mockStore = configureStore(middlewares)
      const initialState = {
        editor: {
          codeRunTriggered: true
        },
      }
      store = mockStore(initialState);
      container = render(<Provider store={store}><MotionInput defaultValue={true}/></Provider>)
  })
  
  test("Displays checkbox with correct value", () => {
    expect(container.queryByLabelText(/Motion/).checked).toBe(true)
  })
  
  test("Stop motion function has been called", () => {
    expect(start_motion_function).toHaveBeenCalledTimes(1)
  })

  test("Skulpt sense hat motion set to true", () => {
    expect(Sk.sense_hat.motion).toBe(true)
  })
})

describe("No motion and code not running", () => {
  beforeEach(() => {
    Sk.sense_hat={
      start_motion_callback: start_motion_function,
      stop_motion_callback: stop_motion_function
    }
    const middlewares = []
      const mockStore = configureStore(middlewares)
      const initialState = {
        editor: {
          codeRunTriggered: false
        },
      }
      store = mockStore(initialState);
      container = render(<Provider store={store}><MotionInput defaultValue={false}/></Provider>)
  })

  test("Stop motion function not called", () => {
    expect(stop_motion_function).not.toHaveBeenCalled()
  })
})

describe("Motion and code not running", () => {
  beforeEach(() => {
    Sk.sense_hat={
      start_motion_callback: start_motion_function,
      stop_motion_callback: stop_motion_function
    }
    const middlewares = []
      const mockStore = configureStore(middlewares)
      const initialState = {
        editor: {
          codeRunTriggered: false
        },
      }
      store = mockStore(initialState);
      container = render(<Provider store={store}><MotionInput defaultValue={true}/></Provider>)
  })

  test("Start motion function not called", () => {
    expect(start_motion_function).not.toHaveBeenCalled()
  })
})
