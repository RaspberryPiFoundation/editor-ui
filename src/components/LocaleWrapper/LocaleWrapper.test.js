import React from "react";
import { render, screen } from "@testing-library/react";
import LocaleWrapper from "./LocaleWrapper";
import { useTranslation } from "react-i18next";

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({
    locale: 'es-LA'
  })
}))

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn()
}))

beforeEach(() => {
  jest.clearAllMocks()
  useTranslation.mockReturnValue({
    i18n: {
      changeLanguage: jest.fn(() => new Promise(() => {}))
    }
  })

  render(<LocaleWrapper><p>Hello world</p></LocaleWrapper>)
})

test('Renders children', () => {
  expect(screen.getByText('Hello world')).toBeInTheDocument()
})

test('Sets the language', () => {
  expect(useTranslation().i18n.changeLanguage).toHaveBeenCalledWith('es-LA', expect.anything())
})
