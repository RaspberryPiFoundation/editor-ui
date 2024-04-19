import { render, screen, fireEvent } from "@testing-library/react";
import Step3 from "./Step3";

describe("When localStorage is empty", () => {
  beforeEach(() => {
    render(<Step3 />);
  });

  test("it renders", () => {
    expect(
      screen.queryByText("schoolOnboarding.steps.step3.title"),
    ).toBeInTheDocument();
  });

  test("the role select is empty", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step3.role"),
    ).toHaveValue("");
  });

  test("the department input is blank", () => {
    expect(
      screen.getByLabelText(/schoolOnboarding.steps.step3.department/),
    ).toHaveValue("");
  });

  test("selecting a role updates localStorage", () => {
    const selectElement = screen.getByLabelText(
      "schoolOnboarding.steps.step3.role",
    );
    fireEvent.change(selectElement, { target: { value: "teacher" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_3.role,
    ).toBe("teacher");
  });

  test("typing in the department input updates localStorage", () => {
    const inputElement = screen.getByLabelText(
      /schoolOnboarding.steps.step3.department/,
    );
    fireEvent.change(inputElement, { target: { value: "Drama" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_3.department,
    ).toBe("Drama");
  });
});

describe("When previous data is in localStorage", () => {
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        step_3: { role: "adminastrative_staff", department: "English" },
      }),
    );
    render(<Step3 />);
  });

  test("the role select is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step3.role"),
    ).toHaveValue("adminastrative_staff");
  });

  test("the department input is populated correctly", () => {
    expect(
      screen.getByLabelText(/schoolOnboarding.steps.step3.department/),
    ).toHaveValue("English");
  });
});

afterEach(() => {
  localStorage.removeItem("schoolOnboarding");
});
