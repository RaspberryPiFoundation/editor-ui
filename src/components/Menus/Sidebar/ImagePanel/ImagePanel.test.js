import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ImagePanel from "./ImagePanel";

const createMockStore = () => {
  const mockStore = configureStore([]);
  return mockStore({
    editor: {
      project: {
        components: [],
        images: [
          {
            url: "path/to/image1",
            filename: "image1.jpg",
          },
          {
            filename: "image2.png",
            url: "path/to/image2",
          },
        ],
      },
    },
  });
};

let store;

describe("When project has multiple files", () => {
  beforeEach(() => {
    store = createMockStore();
    render(
      <Provider store={store}>
        <ImagePanel />
      </Provider>,
    );
  });

  test("Renders heading", () => {
    expect(screen.queryByText("imagePanel.gallery")).toBeInTheDocument();
  });

  test("Renders images", () => {
    expect(screen.queryByAltText("image1.jpg")).toBeInTheDocument();
    expect(screen.queryByAltText("image2.png")).toBeInTheDocument();
  });
});
