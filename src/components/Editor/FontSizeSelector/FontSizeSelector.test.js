import React from "react";
import { render, fireEvent } from "@testing-library/react"
import FontSizeSelector from "./FontSizeSelector";
import { Cookies, CookiesProvider } from 'react-cookie';

describe("When font size cookie unset", () => {
  let cookies;
  let fontSelector;

  beforeEach(() => {
    cookies = new Cookies();
    fontSelector = render(
      <CookiesProvider cookies={cookies}>
        <FontSizeSelector />
      </CookiesProvider>
    )
  })

  test('Cookie remains unset after render', () => {
    expect(cookies.cookies.fontSize).toBeUndefined()
  })

  test('Sets cookie to large when first button clicked', async () => {
    const largeButton = fontSelector.getByText("Large").parentElement
    fireEvent.click(largeButton)
    expect(cookies.cookies.fontSize).toBe("large")
  })

  test('Sets cookie to medium when second button clicked', async () => {
    const mediumButton = fontSelector.getByText("Medium").parentElement
    fireEvent.click(mediumButton)
    expect(cookies.cookies.fontSize).toBe("medium")
  })

  test('Sets cookie to small when third button clicked', async () => {
    const smallButton = fontSelector.getByText("Small").parentElement
    fireEvent.click(smallButton)
    expect(cookies.cookies.fontSize).toBe("small")
  })

  afterEach(() => {
    cookies.remove("theme")
  })
})
