import React from "react";
import ReactThreeTestRenderer from "@react-three/test-renderer";

import FlightCase from "./FlightCase";

test("3D model loads and renders", async () => {
  await ReactThreeTestRenderer.create(<FlightCase />);
});
