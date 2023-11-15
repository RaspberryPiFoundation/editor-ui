import DownloadPanel from "./DownloadPanel";
import { fireEvent, render, screen } from "@testing-library/react";

let container;
describe("DownloadPanel", () => {
  beforeEach(() => {
    container = render(<DownloadPanel />);
  });
  test("Renders the correct heading", () => {
    expect(container.getByText("downloadPanel.heading")).not.toBeNull();
  });

  test("Renders the correct subtitle", () => {
    expect(container.getByText("downloadPanel.subtitle")).not.toBeNull();
  });

  test("Renders the log-in hint", () => {
    expect(container.getByText("downloadPanel.logInHint")).not.toBeNull();
  });

  test("Renders the log-in button", () => {
    expect(container.getByText("downloadPanel.logInButton")).not.toBeNull();
  });

  test("Renders the sign-up button", () => {
    expect(container.getByText("downloadPanel.signUpButton")).not.toBeNull();
  });
});
