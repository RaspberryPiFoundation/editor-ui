import { render, screen } from "@testing-library/react";
import MembersPage from "./MembersPage";

beforeEach(() => {
  render(<MembersPage />);
});

test("it renders", () => {
  expect(screen.queryByText("membersPage.title")).toBeInTheDocument();
});
