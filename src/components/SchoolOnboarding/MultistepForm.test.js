import { render, screen, waitFor } from "@testing-library/react";
import MultiStepForm from "./MultistepForm";

describe("When localStorage is empty", () => {
  beforeEach(() => {
    render(<MultiStepForm />);
  });

  test("it default to step 1", () => {
    expect(
      screen.queryByText("schoolOnboarding.steps.step1.title"),
    ).toBeInTheDocument();
  });

  test("it renders a next button", () => {
    expect(screen.queryByText("schoolOnboarding.continue")).toBeInTheDocument();
  });

  test("it renders a cancel button", () => {
    expect(screen.queryByText("schoolOnboarding.cancel")).toBeInTheDocument();
  });

  test("clicking next takes you to step 2", async () => {
    screen.getByText("schoolOnboarding.continue").click();
    await waitFor(() =>
      expect(
        screen.queryByText("schoolOnboarding.steps.step2.title"),
      ).toBeInTheDocument(),
    );
  });
});

describe("When there is a step in localStorage", () => {
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({ currentStep: 2 }),
    );
    render(<MultiStepForm />);
  });

  test("it renders the step from localStorage", async () => {
    await waitFor(() =>
      expect(
        screen.queryByText("schoolOnboarding.steps.step3.title"),
      ).toBeInTheDocument(),
    );
  });

  test("it renders a previous button", async () => {
    await waitFor(() =>
      expect(screen.queryByText("schoolOnboarding.back")).toBeInTheDocument(),
    );
  });

  test("clicking previous takes you to the previous step", async () => {
    screen.getByText("schoolOnboarding.back").click();
    await waitFor(() =>
      expect(
        screen.queryByText("schoolOnboarding.steps.step2.title"),
      ).toBeInTheDocument(),
    );
  });
});

describe("When on the last step", () => {
  beforeEach(() => {
    localStorage.setItem(
      "schoolOnboarding",
      JSON.stringify({ currentStep: 3 }),
    );
    render(<MultiStepForm />);
  });

  test("it renders a submit button", async () => {
    await waitFor(() =>
      expect(screen.queryByText("schoolOnboarding.submit")).toBeInTheDocument(),
    );
  });
});

afterEach(() => {
  localStorage.removeItem("schoolOnboarding");
});
