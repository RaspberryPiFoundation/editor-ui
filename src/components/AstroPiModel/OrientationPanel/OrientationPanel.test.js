import React from "react";
import { render } from "@testing-library/react";
import OrientationPanel from "./OrientationPanel";

let panel;
const resetFunction = jest.fn()

beforeAll(() => {
  panel = render(<OrientationPanel orientation={[278, 84, 327]} resetOrientation={resetFunction}/>)
})

test("Renders roll, pitch and yaw values", () => {
  expect(panel.queryByText("output.senseHat.model.roll: 278")).not.toBeNull()
  expect(panel.queryByText("output.senseHat.model.pitch: 84")).not.toBeNull()
  expect(panel.queryByText("output.senseHat.model.yaw: 327")).not.toBeNull()
})
