import { render, screen } from "@testing-library/react";
import SchoolAlreadyExists from "./SchoolAlreadyExists";

beforeEach(() => {
  render(<SchoolAlreadyExists />);
});

test("it renders", () => {
  expect(screen.queryByText("schoolAlreadyExists.title")).toBeInTheDocument();
});
