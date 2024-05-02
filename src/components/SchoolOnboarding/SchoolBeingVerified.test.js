import { render, screen } from "@testing-library/react";
import SchoolBeingVerified from "./SchoolBeingVerified";

beforeEach(() => {
  render(<SchoolBeingVerified />);
});

test("it renders", () => {
  expect(screen.queryByText("schoolBeingVerified.title")).toBeInTheDocument();
});
