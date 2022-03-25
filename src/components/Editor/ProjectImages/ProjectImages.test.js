import React from "react";
import { queryAllByAltText, queryByAltText, render } from "@testing-library/react"
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import ProjectImages from "./ProjectImages";

describe("Project with images", () => {
    let queryByAltText;
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
                    image_list: [
                        {
                            filename: "image1.jpg",
                            url: "https://images.unsplash.com/photo-1646772755632-74e998fec9ef?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzNXx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60"
                        },
                        {
                            filename: "image2.jpg",
                            url: "https://images.unsplash.com/photo-1646776701870-f79b655f1a6f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw1Nnx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=60"
                        },
                    ]
                }
            },
        }
        const store = mockStore(initialState);
        ({queryByAltText, queryByText} = render(<Provider store={store}><ProjectImages /></Provider>))
    })

    test("Image names are rendered", () => {
        expect(queryByText("image1.jpg")).not.toBeNull()
        expect(queryByText("image2.jpg")).not.toBeNull()
    }) 

    test("Images are rendered", () => {
        expect(queryByAltText("image1.jpg")).not.toBeNull()
        expect(queryByAltText("image2.jpg")).not.toBeNull()
    })
})
