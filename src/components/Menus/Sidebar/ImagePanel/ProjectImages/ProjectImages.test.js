import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ProjectImages from "./ProjectImages";

describe("Project with images", () => {
  let queryByAltText;
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
          images: [
            {
              filename: "image1.jpg",
              url: "image1_url",
            },
            {
              filename: "image2.jpg",
              url: "image2_url",
            },
          ],
        },
      },
    };
    const store = mockStore(initialState);
    ({ queryByAltText, queryByText } = render(
      <Provider store={store}>
        <ProjectImages />
      </Provider>,
    ));
  });

  test("Image names are rendered", () => {
    expect(queryByText("image1.jpg")).not.toBeNull();
    expect(queryByText("image2.jpg")).not.toBeNull();
  });

  test("Images are rendered", () => {
    expect(queryByAltText("image1.jpg")).not.toBeNull();
    expect(queryByAltText("image2.jpg")).not.toBeNull();
  });

  test("Images have the expected source", () => {
    expect(queryByAltText("image1.jpg")).toHaveAttribute("src", "image1_url");
    expect(queryByAltText("image2.jpg")).toHaveAttribute("src", "image2_url");
  });
});
