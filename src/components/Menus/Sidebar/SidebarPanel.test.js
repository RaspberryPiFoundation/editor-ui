import React from "react";
import { render, screen } from "@testing-library/react";
import SidebarPanel from "./SidebarPanel";

test("Renders", () => {
  render(<SidebarPanel heading="heading">some content</SidebarPanel>);
  expect(screen.queryByText("heading")).toBeInTheDocument();
});
