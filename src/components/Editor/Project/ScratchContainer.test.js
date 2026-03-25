import { act, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ScratchContainer from "./ScratchContainer";
import EditorReducer from "../../../redux/EditorSlice";

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
    const store = configureStore({
      reducer: {
        editor: EditorReducer,
      },
      preloadedState: {
        editor: {
          project: {
            identifier: "project-123",
            project_type: "code_editor_scratch",
          },
          scratchIframeProjectIdentifier: "project-123",
          scratchApiEndpoint: "https://api.example.com/v1",
        },
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

  test("updates the parent project identifier without reloading the iframe project_id", () => {
    const store = configureStore({
      reducer: {
        editor: EditorReducer,
      },
      preloadedState: {
        editor: {
          project: {
            identifier: "project-123",
            project_type: "code_editor_scratch",
          },
          scratchIframeProjectIdentifier: "project-123",
          scratchApiEndpoint: "https://api.example.com/v1",
        },
      },
    });

    render(
      <Provider store={store}>
        <ScratchContainer />
      </Provider>,
    );

    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", {
          origin: "https://example.com",
          data: {
            type: "scratch-gui-project-id-updated",
            projectId: "project-456",
          },
        }),
      );
    });

    expect(store.getState().editor.project.identifier).toBe("project-456");
    expect(store.getState().editor.scratchIframeProjectIdentifier).toBe(
      "project-123",
    );

    const url = new URL(screen.getByTitle("Scratch").getAttribute("src"));
    expect(url.searchParams.get("project_id")).toBe("project-123");
  });
});
