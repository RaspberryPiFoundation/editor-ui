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

test("Renders a single button", () => {
  render(
    <SidebarPanel heading="heading" buttons={[{ text: "button" }]}>
      some content
    </SidebarPanel>,
  );
  expect(screen.queryByText("button")).toBeInTheDocument();
});

test("Renders multiple buttons", () => {
  render(
    <SidebarPanel
      heading="heading"
      buttons={[{ text: "button one" }, { text: "button two" }]}
    >
      some content
    </SidebarPanel>,
  );
  expect(screen.queryByText("button one")).toBeInTheDocument();
  expect(screen.queryByText("button two")).toBeInTheDocument();
});
