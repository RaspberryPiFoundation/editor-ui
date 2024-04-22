import { render, screen } from "@testing-library/react";
import TextWithBoldSpan from "./TextWithBoldSpan";
import { I18nextProvider } from "react-i18next";
import i18n from "../../utils/i18n";
import { BrowserRouter } from "react-router-dom";

jest.unmock("react-i18next");
jest.unmock("../../utils/i18n");

beforeEach(() => {
  render(
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <TextWithBoldSpan i18nKey="text with something in <0>bold</0>" />
      </BrowserRouter>
    </I18nextProvider>,
  );
});

test("Renders the text", () => {
  expect(screen.queryByText(/text with something in/)).toBeInTheDocument();
});

test("Renders the bold text", () => {
  expect(screen.queryByText("bold")).toHaveAttribute(
    "class",
    "school-onboarding__text--bold",
  );
});
