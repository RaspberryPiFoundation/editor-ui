import React from "react";
import ReactThreeTestRenderer from '@react-three/test-renderer';

import FlightCase from "./FlightCase";
import Sk from 'skulpt';

test("3D model loads and renders", async () => {
  const renderer = await ReactThreeTestRenderer.create(<FlightCase/>)
  console.log(renderer.toTree())
})


