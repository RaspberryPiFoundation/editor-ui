import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Cookies, CookiesProvider } from "react-cookie";
import AiHintToggle from "./AiHintToggle";

const renderToggle = (cookieValue) => {
  const cookies = new Cookies();
  if (cookieValue) cookies.set("aiHint", cookieValue);
  render(
    <CookiesProvider cookies={cookies}>
      <AiHintToggle />
    </CookiesProvider>,
  );
  return { cookies, toggle: screen.getByRole("switch") };
};

describe("AiHintToggle", () => {
  afterEach(() => {
    new Cookies().remove("aiHint", { path: "/" });
  });

  test("is on by default", () => {
    const { toggle } = renderToggle();
    expect(toggle).toBeChecked();
  });

  test("is off when the cookie is set to off", () => {
    const { toggle } = renderToggle("off");
    expect(toggle).not.toBeChecked();
  });

  test("sets the cookie to off when turned off", () => {
    const { cookies, toggle } = renderToggle();
    fireEvent.click(toggle);
    expect(cookies.get("aiHint")).toBe("off");
    expect(toggle).not.toBeChecked();
  });

  test("sets the cookie to on when turned back on", () => {
    const { cookies, toggle } = renderToggle("off");
    fireEvent.click(toggle);
    expect(cookies.get("aiHint")).toBe("on");
    expect(toggle).toBeChecked();
  });
});
