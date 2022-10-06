import React from "react";

import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

test('Footer renders', () => {
  render(<Footer/>)
  expect(screen.queryByText(/Raspberry Pi Foundation/)).toBeInTheDocument()
})

test('Links to privacy policy', () => {
  render(<Footer/>)
  expect(screen.queryByText('Privacy')).toHaveAttribute('href', 'https://www.raspberrypi.org/privacy')
})

test('Links to cookie policy', () => {
  render(<Footer/>)
  expect(screen.queryByText('Cookies')).toHaveAttribute('href', 'https://www.raspberrypi.org/cookies')
})

test('Links to accessibility policy', () => {
  render(<Footer/>)
  expect(screen.queryByText('Accessibility')).toHaveAttribute('href', 'https://www.raspberrypi.org/accessibility')
})

test('Links to safeguarding policy', () => {
  render(<Footer/>)
  expect(screen.queryByText('Safeguarding')).toHaveAttribute('href', 'https://www.raspberrypi.org/safeguarding')
})
