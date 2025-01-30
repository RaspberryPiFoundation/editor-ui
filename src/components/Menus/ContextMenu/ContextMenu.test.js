import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import ContextMenu from "./ContextMenu";

import "../../../consoleMock";

expect.extend(toHaveNoViolations);
const action1 = jest.fn();

describe("With file items", () => {
  beforeEach(() => {
    render(
      <ContextMenu
        MenuButtonIcon={() => {}}
        menuButtonLabel="button"
        menuOptions={[{ text: "option1", action: action1, icon: () => {} }]}
      />,
    );
  });

  test("Menu is not visible initially", () => {
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("Clicking button makes menu content appear", () => {
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(screen.queryByRole("menu")).toBeInTheDocument();
  });

  test("Clicking option button calls action", () => {
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const menuOption = screen.queryByText("option1");
    fireEvent.click(menuOption);
    expect(action1).toHaveBeenCalled();
  });

  test("It passes AXE accessibility testing when menu is closed", async () => {
    const axeResults = await axe(screen.queryByRole("button"));
    expect(axeResults).toHaveNoViolations();
  });

  test("It passes AXE accessibility testing when menu is open", async () => {
    const button = screen.getByRole("button");
    fireEvent.click(button);
    const axeResults = await axe(screen.queryByRole("menu"));
    expect(axeResults).toHaveNoViolations();
  });
});
