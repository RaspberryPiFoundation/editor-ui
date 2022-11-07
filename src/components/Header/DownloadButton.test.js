import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DownloadButton from "./DownloadButton";
import FileSaver from 'file-saver';
import JSZip from 'jszip'

jest.mock("file-saver")
jest.mock("jszip")

let downloadButton;

beforeEach(() => {
  JSZip.mockClear();
  const middlewares = []
  const mockStore = configureStore(middlewares)
  const initialState = {
    editor: {
      project: {
        name: 'My epic project',
        identifier: "hello-world-project",
        components: [
          {
            name: 'main',
            extension: 'py',
            content: 'print(\'hello world\')'

          }
        ],
        image_list: []
      },
    },
  }
  const store = mockStore(initialState);
  render(<Provider store={store}><DownloadButton /></Provider>)
  downloadButton = screen.queryByText('header.download').parentElement
})

test('Download button renders', ()=> {
  expect(downloadButton).toBeInTheDocument()
})

test('Clicking download button creates download with correct name', async () => {
  fireEvent.click(downloadButton)
  await waitFor( () => expect(FileSaver.saveAs).toHaveBeenCalled())
})

test('zip mocking', async () => {
  fireEvent.click(downloadButton)
  const JSZipInstance = JSZip.mock.instances[0];
  const mockFile = JSZipInstance.file;
  await waitFor( () => expect(mockFile).toHaveBeenCalled())
})
