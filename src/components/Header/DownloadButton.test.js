import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DownloadButton from "./DownloadButton";
import FileSaver from 'file-saver';
import JSZip from 'jszip'

// * From following the manual mock section in the jest docs (not currently working) *
const mockFile = jest.fn()

jest.mock('jszip', () => {
  return jest.fn().mockImplementation(() => {
    return {
      file: mockFile,
      generateAsync: jest.fn()
    }
  })
})

jest.mock('file-saver', () => ({
  saveAs: jest.fn()
}))

// * What we were trying to do earlier *

// const mockFile = jest.fn()

// const mockJSZip = jest.fn().mockImplementation( () => ({
//   file: mockFile,
//   generateAsync: jest.fn()
// }))

// const jszip = jest.createMockFromModule('jszip')
// jszip.JSZip = mockJSZip

// jest.mock('jszip', () => ({
//   // __esModule: true,
//   // default: jest.fn().mockImplementation(),
//   JSZip: jest.fn().mockImplementation( () => ({
//     file: jest.fn(),
//     generateAsync: jest.fn()
// }))
// }))

// * Some more remnants of other things we've tried... *

// const mockFile = jest.fn()

// const mockJSZip = {
//   file: mockFile,
//   generateAsync: jest.fn()
// }

// jszip.mockImplementation(() => {
//   return {
//     file: mockFile,
//     generateAsync: jest.fn()
//   }
// })

let downloadButton;

beforeEach(() => {
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
  await waitFor( () => expect(mockFile).toHaveBeenCalled())
})
