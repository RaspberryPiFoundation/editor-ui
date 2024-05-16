import { render, screen } from "@testing-library/react";
import ErrorMessage from "./ErrorMessage";

beforeEach(() => {
  render(<ErrorMessage error="Something's wrong" />);
});

test("it renders the error", () => {
  expect(screen.queryByText("Something's wrong")).toBeInTheDocument();
});
