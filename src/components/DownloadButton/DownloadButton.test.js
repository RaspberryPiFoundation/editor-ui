import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import DownloadButton from "./DownloadButton";
import FileSaver from "file-saver";
import JSZip from "jszip";
import JSZipUtils from "jszip-utils";
import { closeLoginToSaveModal } from "../../redux/EditorSlice";

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
          image_list: [],
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

test("If login to save modal open, closes it when download clicked", () => {
  JSZip.mockClear();
  const middlewares = [];
  const mockStore = configureStore(middlewares);
  const initialState = {
    editor: {
      project: {
        components: [],
        image_list: [],
      },
      loginToSaveModalShowing: true,
    },
  };
  const store = mockStore(initialState);
  render(
    <Provider store={store}>
      <DownloadButton buttonText="Download" Icon={() => {}} />
    </Provider>,
  );
  const downloadButton = screen.queryByText("Download").parentElement;
  fireEvent.click(downloadButton);
  expect(store.getActions()).toEqual([closeLoginToSaveModal()]);
});
