import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import SidebarBar from "./SidebarBar";

const toggleOption = jest.fn();

beforeEach(() => {
  render(
    <SidebarBar
      menuOptions={[{ name: "file", title: "my_title", popOut: () => {} }]}
      toggleOption={toggleOption}
    />,
  );
});

test("Clicking expand button opens file pane", () => {
  const expandButton = screen.getByTitle("Sidebar.expand");
  fireEvent.click(expandButton);
  expect(toggleOption).toHaveBeenCalledWith("file");
});
