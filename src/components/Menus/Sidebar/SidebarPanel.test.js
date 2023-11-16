import React from "react";
import { render, screen } from "@testing-library/react";
import SidebarPanel from "./SidebarPanel";

const Footer = () => <p>footer</p>;

beforeEach(() => {
  render(
    <SidebarPanel heading="heading" Footer={Footer}>
      some content
    </SidebarPanel>,
  );
});

test("Renders heading", () => {
  expect(screen.queryByText("heading")).toBeInTheDocument();
});

test("Renders content", () => {
  expect(screen.queryByText("some content")).toBeInTheDocument();
});

test("Renders footer", () => {
  expect(screen.queryByText("footer")).toBeInTheDocument();
});
