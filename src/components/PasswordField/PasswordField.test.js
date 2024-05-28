import { render, screen, waitFor } from "@testing-library/react";
import PasswordField from "./PasswordField";

beforeEach(() => {
  render(
    <PasswordField
      label="Password"
      id="password"
      hint="Something you won't forget"
      onChange={jest.fn()}
    />,
  );
});

describe("When first rendered", () => {
  test("it hides the password", () => {
    screen.debug();
    expect(screen.queryByLabelText(/Password/).type).toBe("password");
  });

  test("it displays the Show button", () => {
    expect(screen.queryByText("Show")).toBeInTheDocument();
  });
});

describe("When the Show button is clicked", () => {
  beforeEach(() => {
    screen.getByText("Show").click();
  });

  test("it shows the password", () => {
    expect(screen.queryByLabelText(/Password/).type).toBe("text");
  });
  test("it displays the Hide button", () => {
    expect(screen.queryByText("Hide")).toBeInTheDocument();
  });
});

describe("When the Hide button is clicked", () => {
  beforeEach(async () => {
    screen.getByText("Show").click();
    await waitFor(() => {
      expect(screen.queryByText("Hide")).toBeInTheDocument();
    });
    screen.getByText("Hide").click();
  });

  test("it hides the password", () => {
    expect(screen.queryByLabelText(/Password/).type).toBe("password");
  });

  test("it displays the Show button", () => {
    expect(screen.queryByText("Show")).toBeInTheDocument();
  });
});
