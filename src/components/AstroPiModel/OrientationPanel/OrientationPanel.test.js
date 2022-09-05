import React from "react";
import { render } from "@testing-library/react"
import OrientationPanel from "./OrientationPanel";

let panel;
const resetFunction = jest.fn()

beforeAll(() => {
  panel = render(<OrientationPanel orientation={[278, 84, 327]} resetOrientation={resetFunction}/>)
})

test("Renders roll, pitch and yaw values", () => {
  expect(panel.queryByText("roll: 278")).not.toBeNull()
  expect(panel.queryByText("pitch: 84")).not.toBeNull()
  expect(panel.queryByText("yaw: 327")).not.toBeNull()
})
