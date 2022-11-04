import React from "react";
import { render } from "@testing-library/react"

import SettingsMenu from './SettingsMenu'

test("Renders heading", () => {
  const {queryByText} = render(<SettingsMenu />)
  expect(queryByText("header.settingsMenu.heading")).not.toBeNull();
})

test("Renders section headings", () => {
  const {queryByText} = render(<SettingsMenu />)
  expect(queryByText("header.settingsMenu.theme")).not.toBeNull();
  expect(queryByText("header.settingsMenu.textSize")).not.toBeNull();
})
