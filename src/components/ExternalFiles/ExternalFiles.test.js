import React from "react";
import { render } from "@testing-library/react";
import { Provider } from 'react-redux';
import configureStore from "redux-mock-store";
import ExternalFiles from "./ExternalFiles";

const middlewares = []
const mockStore = configureStore(middlewares)

test("External files component contains text from file with filename id", () => {
    const initialState = {
        editor: {
            project: {
              components: [
                {
                  name: "hello",
                  extension: "txt",
                  content: "hello world!"
                }
              ]
            }
        }
    }
    const store = mockStore(initialState)
    const  {getByText} = render(<Provider store={store}><ExternalFiles /></Provider>);
    const fileContent = getByText("hello world!")
    expect(fileContent).toHaveAttribute('id', 'hello.txt')
})
