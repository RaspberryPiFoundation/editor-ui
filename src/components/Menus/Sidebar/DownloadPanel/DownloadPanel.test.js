import DownloadPanel from "./DownloadPanel";
import { fireEvent, render, screen } from "@testing-library/react";

let container;
describe("DownloadPanel", () => {
  beforeEach(() => {
    container = render(<DownloadPanel />);
  });
  test("Renders the correct heading for the panel", () => {
    expect(container.getByText("downloadPanel.heading")).not.toBeNull();
  });
});
