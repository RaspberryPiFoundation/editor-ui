import React from "react";
import { render, screen } from "@testing-library/react";
import SidebarPanel from "./SidebarPanel";
import { SMALL_SCREEN_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";

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
    <SidebarPanel heading="heading" buttons={[<button key="1">button</button>]}>
      some content
    </SidebarPanel>,
  );
  expect(screen.queryByText("button")).toBeInTheDocument();
});

test("Renders arbitrary header content", () => {
  render(
    <SidebarPanel heading="heading" headerContent={<a href="/x">a link</a>}>
      some content
    </SidebarPanel>,
  );
  expect(screen.queryByRole("link", { name: "a link" })).toBeInTheDocument();
});

test("Renders header content alongside buttons", () => {
  render(
    <SidebarPanel
      heading="heading"
      buttons={[<button key="1">button</button>]}
      headerContent={<p>header note</p>}
    >
      some content
    </SidebarPanel>,
  );
  expect(screen.queryByText("button")).toBeInTheDocument();
  expect(screen.queryByText("header note")).toBeInTheDocument();
});

test("Renders multiple buttons", () => {
  render(
    <SidebarPanel
      heading="heading"
      buttons={[
        <button key="1">button one</button>,
        <button key="2">button two</button>,
      ]}
    >
      some content
    </SidebarPanel>,
  );
  expect(screen.queryByText("button one")).toBeInTheDocument();
  expect(screen.queryByText("button two")).toBeInTheDocument();
});

describe("Default width", () => {
  const originalMatchMedia = window.matchMedia;

  const mockSmallScreen = (matches) => {
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      matches: matches && query === SMALL_SCREEN_MEDIA_QUERY,
    });
  };

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test("Uses the default width on larger screens", () => {
    mockSmallScreen(false);
    render(<SidebarPanel heading="wide panel">some content</SidebarPanel>);
    const panel = screen.getAllByTestId("sidebar__panel").at(-1);
    expect(panel).toHaveStyle({ width: "320px" });
  });

  test("Uses the minimum width on smaller screens", () => {
    mockSmallScreen(true);
    render(<SidebarPanel heading="narrow panel">some content</SidebarPanel>);
    const panel = screen.getAllByTestId("sidebar__panel").at(-1);
    expect(panel).toHaveStyle({ width: "280px" });
  });

  test("Keeps its width when the screen size changes", () => {
    mockSmallScreen(true);
    const { rerender } = render(
      <SidebarPanel heading="resized panel">some content</SidebarPanel>,
    );
    mockSmallScreen(false);
    rerender(<SidebarPanel heading="resized panel">some content</SidebarPanel>);
    const panel = screen.getAllByTestId("sidebar__panel").at(-1);
    expect(panel).toHaveStyle({ width: "280px" });
  });
});
