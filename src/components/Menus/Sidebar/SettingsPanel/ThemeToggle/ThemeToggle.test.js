import React from "react";
import { act, render, fireEvent, screen } from "@testing-library/react";
import ThemeToggle from "./ThemeToggle";
import { Cookies, CookiesProvider } from "react-cookie";

const themeUpdatedHandler = jest.fn();

beforeAll(() => {
  document.addEventListener("editor-themeUpdated", themeUpdatedHandler);
});

describe("When default theme is light mode and cookie unset", () => {
  let cookies;
  let toggleContainer;

  beforeEach(() => {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
    cookies = new Cookies();
    toggleContainer = render(
      <CookiesProvider cookies={cookies}>
        <ThemeToggle />
      </CookiesProvider>,
    );
  });

  test("Cookie remains unset after render", () => {
    expect(cookies.cookies.theme).toBeUndefined();
  });

  test("Sets cookie to dark when button clicked", async () => {
    const button = toggleContainer.getByText(
      "sidebar.settingsMenu.themeOptions.dark",
    );
    fireEvent.click(button);
    expect(cookies.cookies.theme).toBe("dark");
  });

  test("Fires theme updated custom event when button clicked", async () => {
    const button = screen.getByText("sidebar.settingsMenu.themeOptions.dark");
    fireEvent.click(button);
    expect(themeUpdatedHandler).toHaveBeenCalled();
  });

  afterEach(() => {
    cookies.remove("theme");
  });
});

describe("When default theme is dark mode and cookie unset", () => {
  let cookies;
  let toggleContainer;

  beforeEach(() => {
    window.matchMedia = (query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(), // Deprecated
      removeListener: jest.fn(), // Deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
    cookies = new Cookies();
    toggleContainer = render(
      <CookiesProvider cookies={cookies}>
        <ThemeToggle />
      </CookiesProvider>,
    );
  });

  test("Cookie remains unset after render", () => {
    expect(cookies.cookies.theme).toBeUndefined();
  });

  test("Sets cookie to light when button clicked", async () => {
    const button = toggleContainer.getByText(
      "sidebar.settingsMenu.themeOptions.light",
    );
    fireEvent.click(button);
    expect(cookies.cookies.theme).toBe("light");
  });

  test("Fires theme updated custom event when button clicked", async () => {
    const button = screen.getByText("sidebar.settingsMenu.themeOptions.light");
    fireEvent.click(button);
    expect(themeUpdatedHandler).toHaveBeenCalled();
  });

  afterEach(() => {
    cookies.remove("theme");
  });
});

test("Cookie set to dark intially changes to light when button clicked", () => {
  var cookies = new Cookies();
  cookies.set("theme", "dark");
  const toggleContainer = render(
    <CookiesProvider cookies={cookies}>
      <ThemeToggle />
    </CookiesProvider>,
  );
  const button = toggleContainer.getByText(
    "sidebar.settingsMenu.themeOptions.light",
  );
  act(() => {
    fireEvent.click(button);
  });
  expect(cookies.cookies.theme).toBe("light");
});

test("Cookie set to light intially changes to dark when button clicked", () => {
  var cookies = new Cookies();
  cookies.set("theme", "light");
  var toggleContainer = render(
    <CookiesProvider cookies={cookies}>
      <ThemeToggle />
    </CookiesProvider>,
  );
  const button = toggleContainer.getByText(
    "sidebar.settingsMenu.themeOptions.dark",
  );
  act(() => {
    fireEvent.click(button);
  });
  expect(cookies.cookies.theme).toBe("dark");
});

afterAll(() => {
  document.removeEventListener("editor-themeUpdated", themeUpdatedHandler);
});
