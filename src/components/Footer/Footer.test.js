import React from "react";

import { render, screen } from "@testing-library/react";
import Footer from "./Footer";


test('Footer renders', () => {
  render(<Footer/>)
  expect(screen.queryByText(/Raspberry Pi Foundation/)).toBeInTheDocument()
})
