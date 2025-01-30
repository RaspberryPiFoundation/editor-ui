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

const logInHandler = jest.fn();
const signUpHandler = jest.fn();

beforeAll(() => {
  document.addEventListener("editor-logIn", logInHandler);
  document.addEventListener("editor-signUp", signUpHandler);
});

describe("DownloadPanel", () => {
  describe("When not logged in", () => {
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
            images: [
              {
                url: "a.com/b",
              },
            ],
          },
        },
        auth: {},
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
      expect(
        container.getByText("downloadPanel.logInTitle"),
      ).toBeInTheDocument();
    });

    test("Renders the log-in hint", () => {
      expect(
        container.getByText("downloadPanel.logInHint"),
      ).toBeInTheDocument();
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

    test("the log-in button calls a logInHandler when clicked", () => {
      const logInButton = screen.getByText(
        "downloadPanel.logInButton",
      ).parentElement;
      fireEvent.click(logInButton);
      expect(logInHandler).toHaveBeenCalled();
    });

    test("the sign-up button calls a signUpHandler when clicked", () => {
      const signUpButton = screen.getByText(
        "downloadPanel.signUpButton",
      ).parentElement;
      fireEvent.click(signUpButton);
      expect(signUpHandler).toHaveBeenCalled();
    });

    test("Renders the download button", () => {
      expect(
        container.getByText("downloadPanel.downloadButton"),
      ).toBeInTheDocument();
    });

    test("Does not render the save button", () => {
      expect(container.queryByText("header.save")).not.toBeInTheDocument();
    });

    test("The download button initiates a download", async () => {
      const webComponentDownloadButton = screen.getByText(
        "downloadPanel.downloadButton",
      ).parentElement;
      fireEvent.click(webComponentDownloadButton);
      await waitFor(() => expect(FileSaver.saveAs).toHaveBeenCalled());
    });
  });

  describe("When logged in and not the project owner", () => {
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
            images: [
              {
                url: "a.com/b",
              },
            ],
          },
          loading: "success",
        },
        auth: {
          user: {
            access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
            profile: {
              user: "some-user-id",
            },
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

    test("Does not render the log-in subtitle", () => {
      expect(
        container.queryByText("downloadPanel.logInTitle"),
      ).not.toBeInTheDocument();
    });

    test("Does not render the log-in hint", () => {
      expect(
        container.queryByText("downloadPanel.logInHint"),
      ).not.toBeInTheDocument();
    });

    test("Does not render the log-in button", () => {
      expect(
        container.queryByText("downloadPanel.logInButton"),
      ).not.toBeInTheDocument();
    });

    test("Does not render the sign-up button", () => {
      expect(
        container.queryByText("downloadPanel.signUpButton"),
      ).not.toBeInTheDocument();
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

    test("Renders the save button", () => {
      expect(container.getByText("header.save")).toBeInTheDocument();
    });

    test("The download button initiates a download", async () => {
      const webComponentDownloadButton = screen.getByText(
        "downloadPanel.downloadButton",
      ).parentElement;
      fireEvent.click(webComponentDownloadButton);
      await waitFor(() => expect(FileSaver.saveAs).toHaveBeenCalled());
    });
  });

  describe("When logged in and the project owner", () => {
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
            images: [
              {
                url: "a.com/b",
              },
            ],
            user_id: "some-user-id",
          },
          loading: "success",
        },
        auth: {
          user: {
            access_token: "39a09671-be55-4847-baf5-8919a0c24a25",
            profile: {
              user: "some-user-id",
            },
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

    test("Does not render the log-in subtitle", () => {
      expect(
        container.queryByText("downloadPanel.logInTitle"),
      ).not.toBeInTheDocument();
    });

    test("Does not render the log-in hint", () => {
      expect(
        container.queryByText("downloadPanel.logInHint"),
      ).not.toBeInTheDocument();
    });

    test("Does not render the log-in button", () => {
      expect(
        container.queryByText("downloadPanel.logInButton"),
      ).not.toBeInTheDocument();
    });

    test("Does not render the sign-up button", () => {
      expect(
        container.queryByText("downloadPanel.signUpButton"),
      ).not.toBeInTheDocument();
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

    test("Does not render the save button", () => {
      expect(container.queryByText("header.save")).not.toBeInTheDocument();
    });

    test("The download button initiates a download", async () => {
      const webComponentDownloadButton = screen.getByText(
        "downloadPanel.downloadButton",
      ).parentElement;
      fireEvent.click(webComponentDownloadButton);
      await waitFor(() => expect(FileSaver.saveAs).toHaveBeenCalled());
    });
  });
});

afterAll(() => {
  document.removeEventListener("editor-logIn", logInHandler);
  document.removeEventListener("editor-signUp", signUpHandler);
});
