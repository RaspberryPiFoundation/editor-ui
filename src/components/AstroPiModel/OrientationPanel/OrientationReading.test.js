import React from "react";
import { render, fireEvent } from "@testing-library/react"
import OrientationReading from "./OrientationReading";

let reading;

beforeEach(() => {
  reading = render(<OrientationReading name={"foo"} value={123.8}/>)
})

test("Renders name", () => {
  expect(reading.queryByText(/foo/)).not.toBeNull()
})

test("Renders rounded value", () => {
  expect(reading.queryByText(/124/)).not.toBeNull()
})
