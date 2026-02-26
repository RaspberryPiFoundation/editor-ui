import configureStore from "redux-mock-store";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import ScratchContainer from "./ScratchContainer";

describe("ScratchContainer", () => {
  let originalAssetsUrl;

  beforeEach(() => {
    originalAssetsUrl = process.env.ASSETS_URL;
    process.env.ASSETS_URL = "https://example.com";
  });

  afterEach(() => {
    process.env.ASSETS_URL = originalAssetsUrl;
  });

  test("renders iframe with src built from project_id and api_url", () => {
    const mockStore = configureStore([]);
    const store = mockStore({
      editor: {
        project: {
          identifier: "project-123",
        },
        scratchApiEndpoint: "https://api.example.com/v1",
      },
    });

    render(
      <Provider store={store}>
        <ScratchContainer />
      </Provider>,
    );

    const iframe = screen.getByTitle("Scratch");
    expect(iframe).toBeInTheDocument();

    const url = new URL(iframe.getAttribute("src"));
    expect(url.pathname).toBe("/scratch.html");
    expect(url.searchParams.get("project_id")).toBe("project-123");
    expect(url.searchParams.get("api_url")).toBe("https://api.example.com/v1");
  });
});
