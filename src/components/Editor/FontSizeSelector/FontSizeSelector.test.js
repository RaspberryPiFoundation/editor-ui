import React from "react";
import { render, fireEvent } from "@testing-library/react"
import FontSizeSelector from "./FontSizeSelector";
import { Cookies, CookiesProvider } from 'react-cookie';

describe("When font size cookie unset", () => {
  let cookies;
  let fontSelector;
  let buttons;

  beforeEach(() => {
    cookies = new Cookies();
    fontSelector = render(
      <CookiesProvider cookies={cookies}>
        <FontSizeSelector />
      </CookiesProvider>
    )
    // buttons = fontSelector.getAllByText("Aa")
  })

  test('Cookie remains unset after render', () => {
    expect(cookies.cookies.fontSize).toBeUndefined()
  })

  // test('Sets cookie to large when first button clicked', async () => {
  //   fireEvent.click(buttons[0])
  //   expect(cookies.cookies.fontSize).toBe("large")
  // })

  // test('Sets cookie to medium when second button clicked', async () => {
  //   fireEvent.click(buttons[1])
  //   expect(cookies.cookies.fontSize).toBe("medium")
  // })

  // test('Sets cookie to small when third button clicked', async () => {
  //   fireEvent.click(buttons[2])
  //   expect(cookies.cookies.fontSize).toBe("small")
  // })

  afterEach(() => {
    cookies.remove("theme")
  })
})
