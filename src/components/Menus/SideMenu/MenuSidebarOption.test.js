import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MenuSideBarOption from "./MenuSideBarOption";

const toggleOption = jest.fn();

beforeEach(() => {
  render(
    <MenuSideBarOption
      name = 'file'
      title = 'my_title'
      toggleOption = {toggleOption}
    />
  )
})

test('Clicking expand button with correct title opens file pane', () => {
  const optionButton = screen.getByTitle('my_title')
  fireEvent.click(optionButton)
  expect(toggleOption).toHaveBeenCalledWith('file')
})
