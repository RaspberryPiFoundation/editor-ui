import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SidebarBarOption from "./SidebarBarOption";

const toggleOption = jest.fn();

const renderOption = (props = {}) =>
  render(
    <SidebarBarOption
      name="file"
      title="my_title"
      toggleOption={toggleOption}
      {...props}
    />,
  );

beforeEach(() => {
  toggleOption.mockClear();
});

test("Clicking expand button with correct title opens file pane", () => {
  renderOption();
  const optionButton = screen.getByTitle("my_title");
  fireEvent.click(optionButton);
  expect(toggleOption).toHaveBeenCalledWith("file");
});

test("Adds plugin styling when plugin metadata present", () => {
  renderOption({ plugin: { id: "sample-plugin" } });
  const optionButton = screen.getByTitle("my_title");
  expect(optionButton).toHaveClass("sidebar__bar-option--plugin");
  const wrapper = optionButton.closest("div");
  expect(wrapper).toHaveAttribute("data-plugin-id", "sample-plugin");
});
