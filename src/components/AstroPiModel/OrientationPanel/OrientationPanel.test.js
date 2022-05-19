import React from "react";
import { render } from "@testing-library/react"
import OrientationPanel from "./OrientationPanel";
import Sk from 'skulpt';

let panel;
const resetFunction = jest.fn()

beforeAll(() => {
  panel = render(<OrientationPanel orientation={[278.3, 84.2, 327.5]} resetOrientation={resetFunction}/>)
})

test("Renders roll, pitch and yaw values", () => {
  expect(panel.queryByText("278.3")).not.toBeNull()
  expect(panel.queryByText("84.2")).not.toBeNull()
  expect(panel.queryByText("327.5")).not.toBeNull()
})
