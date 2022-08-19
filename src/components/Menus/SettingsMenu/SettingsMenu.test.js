import React from "react";
import { render } from "@testing-library/react"

import SettingsMenu from './SettingsMenu'

test("Renders heading", () => {
  const {queryByText} = render(<SettingsMenu />)
  expect(queryByText("Settings")).not.toBeNull();
})

test("Renders section headings", () => {
  const {queryByText} = render(<SettingsMenu />)
  expect(queryByText("Colour Mode")).not.toBeNull();
  expect(queryByText("Text Size")).not.toBeNull();
})
