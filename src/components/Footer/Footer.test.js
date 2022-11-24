import React from "react";

import { render, screen } from "@testing-library/react";
import Footer from "./Footer";

test('Footer renders', () => {
  render(<Footer/>)
  expect(screen.queryByText('footer.charityNameAndNumber')).toBeInTheDocument()
})

test('Links to privacy policy', () => {
  render(<Footer/>)
  expect(screen.queryByText('footer.privacy')).toHaveAttribute('href', 'https://www.raspberrypi.org/privacy')
})

test('Links to cookie policy', () => {
  render(<Footer/>)
  expect(screen.queryByText('footer.cookies')).toHaveAttribute('href', 'https://www.raspberrypi.org/cookies')
})

test('Links to accessibility policy', () => {
  render(<Footer/>)
  expect(screen.queryByText('footer.accessibility')).toHaveAttribute('href', 'https://www.raspberrypi.org/accessibility')
})

test('Links to safeguarding policy', () => {
  render(<Footer/>)
  expect(screen.queryByText('footer.safeguarding')).toHaveAttribute('href', 'https://www.raspberrypi.org/safeguarding')
})
