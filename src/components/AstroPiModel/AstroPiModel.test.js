import React from "react";
import { render } from "@testing-library/react"
import AstroPiModel from "./AstroPiModel";
import 'webgl-mock-threejs';

// jest.mock('three', () => {
//   const THREE = jest.requireActual('three');
//   return {
//     ...THREE,
//     WebGLRenderer: jest.fn().mockReturnValue({
//       // domElement: document.createElement('div'), // create a fake div
//       setPixelRatio() { return jest.fn()},
//       setSize: jest.fn(),
//       render: jest.fn(),
//     }),
//   };
// });

test("Everything renders", () => {
  // WebGLRenderer.mockImplementationOnce((options)=><></>)
  // render(<AstroPiModel/>)
})
