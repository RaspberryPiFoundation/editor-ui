import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import DownloadButton from "./DownloadButton";
import FileSaver from "file-saver";
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";

jest.mock("file-saver");
jest.mock("jszip");
jest.mock("jszip-utils", () => ({
  getBinaryContent: jest.fn(),
}));

describe("Downloading project with name set", () => {
  let downloadButton;

  beforeEach(() => {
    JSZip.mockClear();
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          name: "My epic project",
          identifier: "hello-world-project",
          instructions: "print hello world to the console",
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
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <DownloadButton buttonText="Download" Icon={() => {}} />
      </Provider>,
    );
    downloadButton = screen.queryByText("Download").parentElement;
  });

  test("Download button renders", () => {
    expect(downloadButton).toBeInTheDocument();
  });

  test("Clicking download zips instructions", async () => {
    fireEvent.click(downloadButton);
    const JSZipInstance = JSZip.mock.instances[0];
    const mockFile = JSZipInstance.file;
    await waitFor(() =>
      expect(mockFile).toHaveBeenCalledWith(
        "INSTRUCTIONS.md",
        "print hello world to the console",
      ),
    );
  });

  test("Clicking download zips project file content", async () => {
    fireEvent.click(downloadButton);
    const JSZipInstance = JSZip.mock.instances[0];
    const mockFile = JSZipInstance.file;
    await waitFor(() =>
      expect(mockFile).toHaveBeenCalledWith("main.py", "print('hello world')"),
    );
  });

  test("Clicking download triggers request for image", async () => {
    fireEvent.click(downloadButton);
    await waitFor(() =>
      expect(JSZipUtils.getBinaryContent).toHaveBeenCalledWith(
        "a.com/b",
        expect.anything(),
      ),
    );
  });

  test("Clicking download button creates download with correct name", async () => {
    fireEvent.click(downloadButton);
    await waitFor(() =>
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        undefined,
        "my_epic_project",
      ),
    );
  });
});

describe("Downloading project with no name set", () => {
  let downloadButton;

  beforeEach(() => {
    JSZip.mockClear();
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
              content: "",
            },
          ],
          images: [],
        },
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <DownloadButton buttonText="Download" Icon={() => {}} />
      </Provider>,
    );
    downloadButton = screen.queryByText("Download").parentElement;
  });

  test("Clicking download button creates download with default name", async () => {
    fireEvent.click(downloadButton);
    await waitFor(() =>
      expect(FileSaver.saveAs).toHaveBeenCalledWith(
        undefined,
        "header_download_file_name_default",
      ),
    );
  });
});

describe("Downloading project with no instructions set", () => {
  let downloadButton;

  beforeEach(() => {
    JSZip.mockClear();
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
              content: "",
            },
          ],
          images: [],
        },
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store}>
        <DownloadButton buttonText="Download" Icon={() => {}} />
      </Provider>,
    );
    downloadButton = screen.queryByText("Download").parentElement;
  });

  test("Clicking download button does not zip instructions", async () => {
    fireEvent.click(downloadButton);
    const JSZipInstance = JSZip.mock.instances[0];
    const mockFile = JSZipInstance.file;
    await waitFor(() =>
      expect(mockFile).not.toHaveBeenCalledWith(
        "INSTRUCTIONS.md",
        expect.anything(),
      ),
    );
  });
});
