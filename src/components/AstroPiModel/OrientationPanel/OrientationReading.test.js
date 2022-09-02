import React from "react";
import { render } from "@testing-library/react"
import OrientationReading from "./OrientationReading";

let reading;

beforeEach(() => {
  reading = render(<OrientationReading name={"foo"} value={123.4}/>)
})

test("Renders name", () => {
  expect(reading.queryByText(/foo/)).not.toBeNull()
})

test("Renders value", () => {
  expect(reading.queryByText("123.4")).not.toBeNull()
})
