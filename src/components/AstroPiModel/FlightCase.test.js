import React from "react";
import {act, render} from '@testing-library/react';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import FlightCase from "./FlightCase";
import Sk from 'skulpt';

// beforeEach(() => jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect))
// afterEach(() => React.useEffect.mockRestore())

test("3D model loads and renders", async () => {
  // const renderer = await ReactThreeTestRenderer.create(<FlightCase/>)
  await act(async () => {
    render(<FlightCase />)
  })
  console.log(Sk.sense_hat_emit)
})


