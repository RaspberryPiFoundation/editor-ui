import React from "react";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../utils/renderWithProviders";
import SidebarPanel, {
  SMALL_SIDEBAR_PROJECT_TYPE,
  SMALL_SIDEBAR_PROJECT_TYPE_BREAKPOINTS,
} from "./SidebarPanel";

const Footer = () => <p>footer</p>;

test("Renders heading", () => {
  renderWithProviders(
    <SidebarPanel heading="heading">some content</SidebarPanel>,
  );
  expect(screen.queryByText("heading")).toBeInTheDocument();
});

test("Renders content", () => {
  renderWithProviders(
    <SidebarPanel heading="heading">some content</SidebarPanel>,
  );
  expect(screen.queryByText("some content")).toBeInTheDocument();
});

test("Renders footer", () => {
  renderWithProviders(
    <SidebarPanel heading="heading" Footer={Footer}>
      some content
    </SidebarPanel>,
  );
  expect(screen.queryByText("footer")).toBeInTheDocument();
});

test("Renders a single button", () => {
  renderWithProviders(
    <SidebarPanel heading="heading" buttons={[<button key="1">button</button>]}>
      some content
    </SidebarPanel>,
  );
  expect(screen.queryByText("button")).toBeInTheDocument();
});

test("Renders arbitrary header content", () => {
  renderWithProviders(
    <SidebarPanel heading="heading" headerContent={<a href="/x">a link</a>}>
      some content
    </SidebarPanel>,
  );
  expect(screen.queryByRole("link", { name: "a link" })).toBeInTheDocument();
});

test("Renders header content alongside buttons", () => {
  renderWithProviders(
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
  renderWithProviders(
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

  const mockMatchingMediaQuery = (matchingQuery) => {
    window.matchMedia = (query) => ({
      ...originalMatchMedia(query),
      matches: query === matchingQuery,
    });
  };

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  test("Uses the default width on larger screens", () => {
    mockMatchingMediaQuery(null);
    renderWithProviders(
      <SidebarPanel heading="wide panel">some content</SidebarPanel>,
    );
    expect(screen.getByTestId("sidebar__panel")).toHaveStyle({
      width: "320px",
    });
  });

  test("Uses the minimum width on smaller screens", () => {
    mockMatchingMediaQuery(SMALL_SIDEBAR_PROJECT_TYPE);
    renderWithProviders(
      <SidebarPanel heading="narrow panel">some content</SidebarPanel>,
    );
    expect(screen.getByTestId("sidebar__panel")).toHaveStyle({
      width: "280px",
    });
  });

  test("Uses the minimum width sooner for project types that need more room", () => {
    mockMatchingMediaQuery(
      SMALL_SIDEBAR_PROJECT_TYPE_BREAKPOINTS.code_editor_scratch,
    );
    renderWithProviders(
      <SidebarPanel heading="scratch panel">some content</SidebarPanel>,
      {
        preloadedState: {
          editor: { project: { project_type: "code_editor_scratch" } },
        },
      },
    );
    expect(screen.getByTestId("sidebar__panel")).toHaveStyle({
      width: "280px",
    });
  });

  test("Uses the default width at that same size for other project types", () => {
    mockMatchingMediaQuery(
      SMALL_SIDEBAR_PROJECT_TYPE_BREAKPOINTS.code_editor_scratch,
    );
    renderWithProviders(
      <SidebarPanel heading="python panel">some content</SidebarPanel>,
      {
        preloadedState: {
          editor: { project: { project_type: "python" } },
        },
      },
    );
    expect(screen.getByTestId("sidebar__panel")).toHaveStyle({
      width: "320px",
    });
  });

  test("Keeps its width when the screen size changes", () => {
    mockMatchingMediaQuery(SMALL_SIDEBAR_PROJECT_TYPE);
    const { rerender } = renderWithProviders(
      <SidebarPanel heading="resized panel">some content</SidebarPanel>,
    );
    mockMatchingMediaQuery(null);
    rerender(<SidebarPanel heading="resized panel">some content</SidebarPanel>);
    expect(screen.getByTestId("sidebar__panel")).toHaveStyle({
      width: "280px",
    });
  });
});
