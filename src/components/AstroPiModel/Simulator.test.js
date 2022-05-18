import React from "react";
import { fireEvent, render } from "@testing-library/react";
import Simulator from "./Simulator";

window.mod = {
  rotateOnWorldAxis: () => {},
  rotation: {
    x: 0,
    y: 0,
    z: 0
  }
}

test("Three canvas renders", () => {
  render(<Simulator/>)
})

test("Moving pointer over model does not change orientation", () => {
  const updateOrientation = jest.fn()
  const simulator = render(<Simulator updateOrientation = {updateOrientation}/>)
  const canvas = simulator.container.querySelector("canvas")
  fireEvent.pointerMove(canvas)
  expect(updateOrientation).not.toHaveBeenCalled()
})

test("Dragging model changes orientation", async () => {
  const updateOrientation = jest.fn()
  const simulator = render(<Simulator updateOrientation = {updateOrientation}/>)
  const canvas = simulator.container.querySelector("canvas")
  fireEvent.pointerDown(canvas)
  fireEvent.pointerMove(canvas)
  expect(updateOrientation).toHaveBeenCalled()
})
