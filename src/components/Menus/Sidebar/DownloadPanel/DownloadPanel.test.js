import DownloadPanel from "./DownloadPanel";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureStore from "redux-mock-store";
import FileSaver from "file-saver";

jest.mock("file-saver");
jest.mock("jszip");
jest.mock("jszip-utils", () => ({
  getBinaryContent: jest.fn(),
}));

let container;
describe("DownloadPanel", () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          name: "My epic project",
          identifier: "hello-world-project",
          components: [
            {
              name: "main",
              extension: "py",
              content: "print('hello world')",
            },
          ],
          image_list: [
            {
              url: "a.com/b",
            },
          ],
        },
      },
    };
    const store = mockStore(initialState);

    container = render(
      <Provider store={store}>
        <MemoryRouter>
          <DownloadPanel />
        </MemoryRouter>
      </Provider>,
    );
  });
  test("Renders the correct heading", () => {
    expect(container.getByText("downloadPanel.heading")).toBeInTheDocument();
  });

  test("Renders the correct subtitle", () => {
    expect(container.getByText("downloadPanel.subtitle")).toBeInTheDocument();
  });

  test("Renders the log-in hint", () => {
    expect(container.getByText("downloadPanel.logInHint")).toBeInTheDocument();
  });

  test("Renders the log-in button", () => {
    expect(
      container.getByText("downloadPanel.logInButton"),
    ).toBeInTheDocument();
  });

  test("Renders the sign-up button", () => {
    expect(
      container.getByText("downloadPanel.signUpButton"),
    ).toBeInTheDocument();
  });

  test("Renders the download hint", () => {
    expect(
      container.getByText("downloadPanel.downloadHint"),
    ).toBeInTheDocument();
  });

  test("Renders the download button", () => {
    expect(
      container.getByText("downloadPanel.downloadButton"),
    ).toBeInTheDocument();
  });

  test("The download button initiates a download", async () => {
    const webComponentDownloadButton = screen.getByText(
      "downloadPanel.downloadButton",
    ).parentElement;
    fireEvent.click(webComponentDownloadButton);
    await waitFor(() => expect(FileSaver.saveAs).toHaveBeenCalled());
  });
});
