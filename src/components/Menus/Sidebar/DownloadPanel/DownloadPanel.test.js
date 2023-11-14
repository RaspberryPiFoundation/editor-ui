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
    expect(container.getByText("downloadPanel.subtitle").not.toBeNull());
  });
});
