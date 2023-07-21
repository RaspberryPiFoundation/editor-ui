import React from "react";
import { act, render, fireEvent } from "@testing-library/react";
import ThemeToggle from "./ThemeToggle";
import { Cookies, CookiesProvider } from "react-cookie";

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
      </CookiesProvider>
    );
  });

  test("Cookie remains unset after render", () => {
    expect(cookies.cookies.theme).toBeUndefined();
  });

  test("Sets cookie to dark when button clicked", async () => {
    const button = toggleContainer.getByText(
      "sidebar.settingsMenu.themeOptions.dark"
    ).parentElement;
    fireEvent.click(button);
    expect(cookies.cookies.theme).toBe("dark");
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
      </CookiesProvider>
    );
  });

  test("Cookie remains unset after render", () => {
    expect(cookies.cookies.theme).toBeUndefined();
  });

  test("Sets cookie to light when button clicked", async () => {
    const button = toggleContainer.getByText(
      "sidebar.settingsMenu.themeOptions.light"
    ).parentElement;
    fireEvent.click(button);
    expect(cookies.cookies.theme).toBe("light");
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
    </CookiesProvider>
  );
  const button = toggleContainer.getByText(
    "sidebar.settingsMenu.themeOptions.light"
  ).parentElement;
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
    </CookiesProvider>
  );
  const button = toggleContainer.getByText(
    "sidebar.settingsMenu.themeOptions.dark"
  ).parentElement;
  act(() => {
    fireEvent.click(button);
  });
  expect(cookies.cookies.theme).toBe("dark");
});
