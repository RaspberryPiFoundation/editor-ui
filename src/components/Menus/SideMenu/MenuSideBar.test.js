import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MenuSideBar from "./MenuSideBar";

const toggleOption = jest.fn()

beforeEach(() => {
  render(
  <MenuSideBar
    menuOptions = {[{name: 'file', title: 'my_title', popOut: () => {}}]}
    toggleOption = {toggleOption}
  />)
})

test('Clicking expand button opens file pane', () => {
  const expandButton = screen.getByTitle('sideMenu.expand')
  fireEvent.click(expandButton)
  expect(toggleOption).toHaveBeenCalledWith('file')
})

