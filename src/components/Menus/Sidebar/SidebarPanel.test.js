import React from "react";
import { render, screen } from "@testing-library/react";
import SidebarPanel from "./SidebarPanel";

const Footer = () => <p>footer</p>;

const renderPanel = (props = {}) =>
  render(
    <SidebarPanel heading="heading" Footer={Footer} {...props}>
      some content
    </SidebarPanel>,
  );

test("Renders heading", () => {
  renderPanel();
  expect(screen.queryByText("heading")).toBeInTheDocument();
});

test("Renders content", () => {
  renderPanel();
  expect(screen.queryByText("some content")).toBeInTheDocument();
});

test("Renders footer", () => {
  renderPanel();
  expect(screen.queryByText("footer")).toBeInTheDocument();
});

test("Forwards plugin id to DOM", () => {
  renderPanel({ pluginId: "example-plugin" });
  expect(screen.getByTestId("sidebar__panel")).toHaveAttribute(
    "data-plugin-id",
    "example-plugin",
  );
});
