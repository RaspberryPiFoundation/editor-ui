import React from "react";
import { createEvent, fireEvent, render } from "@testing-library/react"
import { toHaveAttribute } from "@testing-library/jest-dom"
import { Provider } from 'react-redux';
import configureStore, {getActions} from 'redux-mock-store';

import ImageUploadButton from "./ImageUploadButton";
import {updateImages, setNameError} from "../EditorSlice"

describe("When user logged in and owns project", () => {
    let store;
    let dropzone;
    let button;
    let saveButton;
    let queryByText;

    beforeEach(() => {
        const middlewares = []
        const mockStore = configureStore(middlewares)
        const initialState = {
            editor: {
                project: {
                    components: [
                        {
                            name: "main",
                            extension: "py"
                        }
                    ],
                    image_list: [],
                    project_type: "python",
                    user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
                },
                nameError: "",
            },
            auth: {
                user: {
                    profile: {
                        user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf"
                    }
                }
            }
        }
        store = mockStore(initialState);
        ({queryByText} = render(<Provider store={store}><div id='root'><ImageUploadButton /></div></Provider>))
        button = queryByText(/Upload Image/);
        // fireEvent.click(button);
        // dropzone = queryByText(/Drag and drop/)
        // saveButton = queryByText(/Save/);
    })

    test("Modal opens when Image Upload button clicked", () => {
        fireEvent.click(button)
        const dropzone = queryByText(/Drag and drop/)
        expect(dropzone).not.toBeNull()
    })

    test("Modal closes when cancel button clicked", () => {
        fireEvent.click(button)
        const cancelButton = queryByText(/Cancel/)
        fireEvent.click(cancelButton)
        const dropzone = queryByText(/Drag and drop/)
        expect(dropzone).toBeNull()
    })

    // test("Pressing save adds new image with the given name", () => {
    //     fireEvent.click(button)
    //     const dropzone = queryByText(/Drag and drop/)
    //     fireEvent.drop(dropzone, {
    //         dataTransfer: {
    //             files: [new File(['(⌐□_□)'], 'image1.png', {type: 'image/png'})],
    //         },
    //     })

        // fireEvent.change(inputBox, {target: {value: "file1.py"}})
        // inputBox.innerHTML = "file1.py";
        // const image = new File(['(⌐□_□)'], 'myimage.png', {type: 'image/png'})
        // const dropEvent = new Event('drop');
        // Object.assign(dropEvent, {
        //     dataTransfer: {
        //         files: [image]
        //     }
        // });
        // fireEvent(dropzone, dropEvent)

        // fireEvent.drop(dropzone, {
        //     dataTransfer: {
        //         files: [new File(['(⌐□_□)'], 'chucknorris.png', {type: 'image/png'})]
        //     }
        // })

        // const fileDropzone = getByText('Drag and Drop Excel Files Here');
        // const fileDropEvent = createEvent.drop(dropzone);
        // const fileList = [image];

        // Object.defineProperty(fileDropEvent, 'dataTransfer', {
        // value: {
        //     files: {
        //     item: itemIndex => fileList[itemIndex],
        //     length: fileList.length,
        //     },
        // },
        // });

        // fireEvent(dropzone, fileDropEvent);

        // fireEvent.click(saveButton)
        // const expectedActions = [setNameError(""), addImage({extension: "png", name: "myimage"})]
        // expect(store.getActions()).toEqual(expectedActions);
    // })

    // test("Duplicate file names throws error", () => {
    //     fireEvent.change(inputBox, {target: {value: "main.py"}})
    //     fireEvent.click(saveButton)
    //     const expectedActions = [setNameError(""), setNameError("File names must be unique.")]
    //     expect(store.getActions()).toEqual(expectedActions);
    // })

    // test("Unsupported extension throws error", () => {
    //     fireEvent.change(inputBox, {target: {value: "file1.js"}})
    //     fireEvent.click(saveButton)
    //     const expectedActions = [setNameError(""), setNameError("File names must end in '.py'.")]
    //     expect(store.getActions()).toEqual(expectedActions);
    // })
})
