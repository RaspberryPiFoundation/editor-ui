import React from "react";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import Lighting from "./Lighting";

test("Lighting component renders", async () => {
  await ReactThreeTestRenderer.create(<Lighting />);
});
