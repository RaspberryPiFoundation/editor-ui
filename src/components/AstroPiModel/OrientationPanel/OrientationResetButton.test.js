import React from "react";
import { render, fireEvent } from "@testing-library/react"
import OrientationResetButton from "./OrientationResetButton";

let resetButton;
const resetFunction = jest.fn()

beforeEach(() => {
  resetButton = render(<OrientationResetButton resetOrientation={resetFunction}/>)
})

test("Clicking button calls reset function", () => {
  fireEvent.click(resetButton.getByRole("button"))
  expect(resetFunction).toHaveBeenCalledTimes(1)
})
