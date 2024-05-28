import { render, screen } from "@testing-library/react";
import Step1 from "./Step1";

beforeEach(() => {
  render(<Step1 />);
});

test("it renders", () => {
  expect(
    screen.queryByText("schoolOnboarding.steps.step1.title"),
  ).toBeInTheDocument();
});
