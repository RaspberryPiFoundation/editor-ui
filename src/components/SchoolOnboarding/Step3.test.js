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

  test("creator_role_other isn't visible by default", () => {
    expect(
      screen.queryByLabelText("schoolOnboarding.steps.step3.otherRole"),
    ).not.toBeInTheDocument();
  });

  test("creator_role_other is visible when other is selected in the role field, and is empty", () => {
    const inputElement = screen.getByLabelText(
      /schoolOnboarding.steps.step3.role/,
    );
    fireEvent.change(inputElement, { target: { value: "other" } });
    expect(
      screen.queryByLabelText("schoolOnboarding.steps.step3.otherRole"),
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
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_3.creator_role,
    ).toBe("teacher");
  });

  test("entering creator_role_other updates localStorage", () => {
    const selectElement = screen.getByLabelText(
      "schoolOnboarding.steps.step3.role",
    );
    fireEvent.change(selectElement, { target: { value: "teacher" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_3.creator_role,
    ).toBe("teacher");
  });

  test("typing in the department input updates localStorage", () => {
    let inputElement = screen.getByLabelText(
      /schoolOnboarding.steps.step3.role/,
    );
    fireEvent.change(inputElement, { target: { value: "other" } });
    inputElement = screen.getByLabelText(
      /schoolOnboarding.steps.step3.otherRole/,
    );
    fireEvent.change(inputElement, { target: { value: "a role" } });
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_3
        .creator_role_other,
    ).toBe("a role");
  });
});

describe("When previous data is in localStorage", () => {
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        step_3: {
          creator_role: "administrative_staff",
          creator_department: "English",
        },
      }),
    );
    render(<Step3 />);
  });

  test("the role select is populated correctly", () => {
    expect(
      screen.getByLabelText("schoolOnboarding.steps.step3.role"),
    ).toHaveValue("administrative_staff");
  });

  test("the otherRole select is populated correctly", () => {
    expect(
      screen.queryByLabelText("schoolOnboarding.steps.step3.otherRole"),
    ).not.toBeInTheDocument();
  });

  test("the department input is populated correctly", () => {
    expect(
      screen.getByLabelText(/schoolOnboarding.steps.step3.department/),
    ).toHaveValue("English");
  });
});

describe("When creator_role_other data is in localStorage", () => {
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({
        step_3: {
          creator_role: "other",
          creator_role_other: "a role",
          creator_department: "English",
        },
      }),
    );
    render(<Step3 />);
  });

  test("the otherRole select is populated correctly", () => {
    expect(
      JSON.parse(localStorage.getItem("schoolOnboarding")).step_3
        .creator_role_other,
    ).toBe("a role");
  });
});

afterEach(() => {
  localStorage.removeItem("schoolOnboarding");
});
