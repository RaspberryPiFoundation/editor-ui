import React from "react";
import { fireEvent, render, screen } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DownloadButton from "./DownloadButton";
// import FileSaver from 'file-saver';
// import JSZip from 'jszip';

// jest.mock('file-saver', () => ({
//   saveAs: jest.fn()
// }))

// jest.mock('jszip')

// const mockJSZip = {
//   file: jest.fn(),
//   generateAsync: jest.fn().mockReturnValue(
//     {
//       then: jest.fn()
//     }
//   )
// }

// JSZip.mockImplementation(() => mockJSZip)

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
  downloadButton = screen.queryByText('Download').parentElement
  console.log(downloadButton)
})

test('Download button renders', ()=> {
  expect(downloadButton).toBeInTheDocument()
})

// test('Clicking download button creates download with corrent name', () => {
//   fireEvent.click(downloadButton)
// })
