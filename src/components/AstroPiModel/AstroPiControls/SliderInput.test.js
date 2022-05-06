import React from "react";
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SliderInput from "./SliderInput";
import Sk from 'skulpt';

let queryByText;
let queryByDisplayValue;
Sk.sense_hat={
  rtimu: {
    "foo": [0,0]
  }
}

beforeAll(() => {
  ({queryByText, queryByDisplayValue} = render(<SliderInput name="foo" unit="bar" defaultValue={1234}/>))
})

test("Renders with correct unit and value", () => {
  expect(queryByText("1234bar")).not.toBeNull()
})

// test("Renders input with correct initial value", () => {
//   expect(queryByDisplayValue("1234")).not.toBeNull()
// })

test("Correct skulpt value when renders", () => {
  expect(Sk.sense_hat.rtimu["foo"][1]).toBeLessThan(1234.5)
  expect(Sk.sense_hat.rtimu["foo"][1]).toBeGreaterThanOrEqual(1233.5)
})

