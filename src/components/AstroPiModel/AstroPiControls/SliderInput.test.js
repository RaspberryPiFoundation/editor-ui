import React from "react";
import { render } from "@testing-library/react"
import SliderInput from "./SliderInput";
import Sk from 'skulpt';

let container;
Sk.sense_hat={
  rtimu: {
    "foo": [0,0]
  }
}

beforeEach(() => {
  container = render(<SliderInput name="foo" unit="bar" max={2000} min={0} defaultValue={1234}/>)

})

test("Renders with correct unit and value", () => {
  expect(container.queryByText("1234bar")).not.toBeNull()
})

test("Renders slider input with correct value", () => {
  expect(container.queryByDisplayValue(1234)).not.toBeNull()
})

test("Correct skulpt value when renders", () => {
  expect(Sk.sense_hat.rtimu["foo"][1]).toBeLessThan(1234.5)
  expect(Sk.sense_hat.rtimu["foo"][1]).toBeGreaterThanOrEqual(1233.5)
})
