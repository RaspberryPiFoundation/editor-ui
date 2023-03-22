import React from "react";
import { render } from "@testing-library/react";
import LocaleLayout from "./LocaleLayout";
import { useTranslation } from "react-i18next";
import { MemoryRouter, useLocation } from "react-router-dom";

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: () => ({
    locale: 'es-LA'
  }),
  useNavigate: jest.fn()
}))

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn()
}))

beforeEach(() => {
  jest.clearAllMocks()
  useTranslation.mockReturnValue({
    i18n: {
      changeLanguage: jest.fn(() => new Promise(() => {})),
      options: {
        locales: ['en', 'es-LA']
      }
    }
  })
  render(<MemoryRouter pathname='/es-LA/projects/my-amazing-project'><LocaleLayout/></MemoryRouter>)
})

describe('When locale is allowed', () => {
  beforeEach(() => {
    render(
      <MemoryRouter pathname='/es-LA/projects/my-amazing-project'>
        <LocaleLayout/>
      </MemoryRouter>
    )
  })

  test('Sets the language', () => {
    expect(useTranslation().i18n.changeLanguage).toHaveBeenCalledWith('es-LA', expect.anything())
  })
})

describe('When locale is not allowed', () => {
  beforeEach(() => {
    render(
      <MemoryRouter pathname='/anything/projects/my-amazing-project'>
        <LocaleLayout/>
      </MemoryRouter>
    )
  })

  test('Does not set the language to the requested locale', () => {
    expect(useTranslation().i18n.changeLanguage).not.toHaveBeenCalledWith('anything', expect.anything())
  })

  // test('Redirects to English', () => {
  //   expect(useLocation().pathname).toBe('/en/')
  // })
})
