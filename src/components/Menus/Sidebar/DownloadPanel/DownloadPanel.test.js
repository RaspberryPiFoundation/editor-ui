import DownloadPanel from "./DownloadPanel";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import configureStore from "redux-mock-store";
import FileSaver from "file-saver";
import { WebComponentCustomEvents } from "../../../../events/WebComponentCustomEvents";
jest.mock("file-saver");
jest.mock("jszip");
jest.mock("jszip-utils", () => ({
  getBinaryContent: jest.fn(),
}));
const logInHandler = jest.fn();
const signUpHandler = jest.fn();
let container;

beforeAll(() => {
  document.addEventListener(WebComponentCustomEvents.LogIn, logInHandler);
  document.addEventListener(WebComponentCustomEvents.SignUp, signUpHandler);
});

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

  test("Renders the donwload hint", () => {
    expect(container.getByText("downloadPanel.downloadHint")).not.toBeNull();
  });

  test("the log-in button calls a logInHandler when clicked", async () => {
    const logInButton = screen.getByText(
      "downloadPanel.logInButton",
    ).parentElement;
    fireEvent.click(logInButton);
    await waitFor(() => expect(logInHandler).toHaveBeenCalled());
  });

  test("the sign-up button calls a signUpHandler when clicked", async () => {
    const signUpButton = screen.getByText(
      "downloadPanel.signUpButton",
    ).parentElement;
    fireEvent.click(signUpButton);
    await waitFor(() => expect(signUpHandler).toHaveBeenCalled());
  });

  test("Renders the download button", () => {
    expect(container.getByText("downloadPanel.downloadButton")).not.toBeNull();
  });

  test("The download button initiates a download", async () => {
    const webComponentDownloadButton = screen.getByText(
      "downloadPanel.downloadButton",
    ).parentElement;
    fireEvent.click(webComponentDownloadButton);
    await waitFor(() => expect(FileSaver.saveAs).toHaveBeenCalled());
  });
});

afterAll(() => {
  document.removeEventListener("editor-logIn", logInHandler);
  document.addEventListener("editor-signUp", signUpHandler);
});
