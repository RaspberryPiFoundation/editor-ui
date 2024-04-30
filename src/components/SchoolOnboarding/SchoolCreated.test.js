import { render, screen } from "@testing-library/react";
import SchoolCreated from "./SchoolCreated";

beforeEach(() => {
  render(<SchoolCreated />);
});

test("it renders", () => {
  expect(screen.queryByText("schoolCreated.title")).toBeInTheDocument();
});
