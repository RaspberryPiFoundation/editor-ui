import React from "react";
import { render } from "@testing-library/react";
import LocaleLayout from "./LocaleLayout";
import { useTranslation } from "react-i18next";
import { MemoryRouter, useLocation, useParams } from "react-router-dom";

const mockNavigate = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useParams: jest.fn(),
  useNavigate: () => mockNavigate,
  useLocation: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  useTranslation.mockReturnValue({
    i18n: {
      changeLanguage: jest.fn(() => new Promise(() => {})),
      options: {
        locales: ["en", "es-LA"],
      },
    },
  });
});

describe("When locale is allowed", () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      locale: "es-LA",
    });

    render(
      <MemoryRouter>
        <LocaleLayout />
      </MemoryRouter>,
    );
  });

  test("Does not redirect", () => {
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

describe("When locale is not allowed", () => {
  beforeEach(() => {
    useParams
      .mockReturnValueOnce({
        locale: "anything",
      })
      .mockReturnValue({
        locale: "en",
      });

    useLocation.mockReturnValue({
      pathname: "/anything/projects/my-amazing-project",
    });

    useTranslation.mockReturnValue({
      i18n: {
        language: "default",
        changeLanguage: jest.fn(() => new Promise(() => {})),
        options: {
          locales: ["en", "es-LA", "default"],
          fallbackLng: "default",
        },
      },
    });

    render(
      <MemoryRouter>
        <LocaleLayout />
      </MemoryRouter>,
    );
  });

  test("Redirects to default language", () => {
    expect(mockNavigate).toHaveBeenCalledWith(
      "/default/projects/my-amazing-project",
    );
  });
});
