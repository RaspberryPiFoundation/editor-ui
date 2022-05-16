import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Simulator from "./Simulator";
import ReactThreeTestRenderer from '@react-three/test-renderer';
import 'jest-canvas-mock'

const updateOrientation = jest.fn()

test("Three canvas renders", () => {
  render(<Simulator/>)
})

// test("Dragging model changes orientation", async () => {
//   // const props = {updateOrientation: jest.fn()}
//   const simulator = render(<Simulator updateOrientation={updateOrientation}/>)
//   console.log(simulator.container.innerHTML)
//   fireEvent.pointerDown(simulator.container)
//   fireEvent.pointerMove(simulator.container)
//   expect(updateOrientation).toHaveBeenCalled()
// })

test("Moving pointer over model does not change orientation", () => {
  const simulator = render(<Simulator updateOrientation = {updateOrientation}/>)
  fireEvent.pointerMove(simulator.container)
  expect(updateOrientation).not.toHaveBeenCalled()
})
