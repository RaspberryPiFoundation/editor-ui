import { render, screen } from "@testing-library/react";
import TextWithLink from "./TextWithLink";
import { I18nextProvider } from "react-i18next";
import i18n from "../../utils/i18n";
import { BrowserRouter } from "react-router-dom";

// ignore mocks from setup tests for this file
jest.unmock("react-i18next");
jest.unmock("../../utils/i18n");

beforeEach(() => {
  render(
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <TextWithLink
          i18nKey="text with <0>link</0>"
          to="https://www.example.com"
          linkClassName="my_amazing_link"
        />
      </BrowserRouter>
    </I18nextProvider>,
  );
});

test("Renders the text", () => {
  expect(screen.queryByText(/text with/)).toBeInTheDocument();
});

test("Renders the link", () => {
  expect(screen.queryByText(/link/)).toHaveRole("link");
});

test("Renders the link with the correct href", () => {
  expect(screen.getByRole("link")).toHaveAttribute(
    "href",
    "https://www.example.com",
  );
});

test("Renders the link with the correct class name", () => {
  expect(screen.getByRole("link")).toHaveClass("my_amazing_link");
});
