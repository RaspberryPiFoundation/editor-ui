import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ImageUploadButton from "./ImageUploadButton";

describe("When user logged in and owns project", () => {
  let store;
  let button;
  let queryByText;

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        project: {
          components: [
            {
              name: "main",
              extension: "py",
            },
          ],
          image_list: [],
          project_type: "python",
          user_id: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
        },
        nameError: "",
      },
      auth: {
        user: {
          profile: {
            user: "b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf",
          },
        },
      },
    };
    store = mockStore(initialState);
    ({ queryByText } = render(
      <Provider store={store}>
        <div id="root">
          <ImageUploadButton />
        </div>
      </Provider>,
    ));
    button = queryByText("imageUploadButton.uploadImage");
  });

  test("Modal opens when Image Upload button clicked", () => {
    fireEvent.click(button);
    const dropzone = queryByText("imageUploadButton.info");
    expect(dropzone).not.toBeNull();
  });

  test("Modal closes when cancel button clicked", () => {
    fireEvent.click(button);
    const cancelButton = queryByText("imageUploadButton.cancel");
    fireEvent.click(cancelButton);
    const dropzone = queryByText("imageUploadButton.info");
    expect(dropzone).toBeNull();
  });
});
