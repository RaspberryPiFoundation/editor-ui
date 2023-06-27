import React from "react";

import { render, screen } from "@testing-library/react";
import LandingPage from "./LandingPage";

test("LandingPage renders", () => {
  render(<LandingPage />);
  expect(screen.queryByText("landingPage.projectPython")).toBeInTheDocument();
});

test("Links to Project site", () => {
  render(<LandingPage />);
  expect(screen.queryByText("landingPage.projectHtml")).toHaveAttribute(
    "href",
    "https://projects.raspberrypi.org/en/pathways/web-intro",
  );
});



