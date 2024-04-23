import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import Step2 from "./Step2";

describe("When localStorage is empty", () => {
  beforeEach(() => {
    render(<Step2 />);
  });

  test("it renders", () => {
    expect(
      screen.queryByText("schoolOnboarding.steps.step2.title"),
    ).toBeInTheDocument();
  });

  test("the authority checkbox is unchecked", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step2.agreeAuthority"),
    ).not.toBeChecked();
  });

  test("the responsibility checkbox is unchecked", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step2.termsAndConditions"),
    ).not.toBeChecked();
  });

  test("checking the authority checkbox updates localStorage", () => {
    act(() => {
      screen
        .getByLabelText("schoolOnboarding.steps.step2.agreeAuthority")
        .click();
    });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_2.authority,
    ).toBe(true);
  });

  test("checking the responsibility checkbox updates localStorage", () => {
    act(() => {
      screen
        .getByLabelText("schoolOnboarding.steps.step2.termsAndConditions")
        .click();
    });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_2
        .responsibility,
    ).toBe(true);
  });
});

describe("When previous data is in localStorage", () => {
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({ step_2: { authority: true, responsibility: true } }),
    );
    render(<Step2 />);
  });

  test("the authority checkbox is checked", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step2.agreeAuthority"),
    ).toBeChecked();
  });

  test("the responsibility checkbox is checked", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step2.termsAndConditions"),
    ).toBeChecked();
  });
});

afterEach(() => {
  localStorage.removeItem("schoolOnboarding");
});
