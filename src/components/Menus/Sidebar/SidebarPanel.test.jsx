import React from "react";
import { render, screen } from "@testing-library/react";
import SidebarPanel from "./SidebarPanel";
import { SMALL_SCREEN_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";

let mockMediaQuery = () => false;

vi.mock("react-responsive", async () => ({
  ...(await vi.importActual("react-responsive")),
  useMediaQuery: ({ query }) => mockMediaQuery(query),
}));

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
  afterEach(() => {
    mockMediaQuery = () => false;
  });

  test("Uses the default width on large screens", () => {
    render(
      <SidebarPanel heading="wide panel" defaultWidth="30vw">
        some content
      </SidebarPanel>,
    );
    const panel = screen.getAllByTestId("sidebar__panel").at(-1);
    expect(panel).toHaveStyle({ width: "30vw" });
  });

  test("Uses the minimum width on small screens", () => {
    mockMediaQuery = (query) => query === SMALL_SCREEN_MEDIA_QUERY;
    render(
      <SidebarPanel heading="narrow panel" defaultWidth="30vw">
        some content
      </SidebarPanel>,
    );
    const panel = screen.getAllByTestId("sidebar__panel").at(-1);
    expect(panel).toHaveStyle({ width: "280px" });
  });
});
