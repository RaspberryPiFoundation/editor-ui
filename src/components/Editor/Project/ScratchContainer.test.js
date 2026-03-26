import { render, screen } from "@testing-library/react";
import React, { act } from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ScratchContainer from "./ScratchContainer";
import EditorReducer from "../../../redux/EditorSlice";
import * as scratchIframeUtils from "../../../utils/scratchIframe";

jest.mock("../../../utils/scratchIframe", () => ({
  ...jest.requireActual("../../../utils/scratchIframe"),
  postMessageToScratchIframe: jest.fn(),
}));

describe("ScratchContainer", () => {
  let originalAssetsUrl;

  beforeEach(() => {
    originalAssetsUrl = process.env.ASSETS_URL;
    process.env.ASSETS_URL = "https://example.com";
  });

  afterEach(() => {
    process.env.ASSETS_URL = originalAssetsUrl;
    jest.clearAllMocks();
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

  test("updates the parent project identifier without reloading the iframe project_id", async () => {
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

    await act(async () => {
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

  test("sends scratch-gui-set-token when scratch-gui-ready message is received", () => {
    const store = configureStore({
      reducer: {
        editor: EditorReducer,
        auth: (state = { user: { access_token: "token-123" } }) => state,
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

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://example.com",
        data: {
          type: "scratch-gui-ready",
          nonce: "nonce-abc",
        },
      }),
    );

    expect(scratchIframeUtils.postMessageToScratchIframe).toHaveBeenCalledWith({
      type: "scratch-gui-set-token",
      nonce: "nonce-abc",
      accessToken: "token-123",
    });
  });

  test("does not resend token for duplicate nonce but sends for a new nonce", () => {
    const store = configureStore({
      reducer: {
        editor: EditorReducer,
        auth: (state = { user: { access_token: "token-123" } }) => state,
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

    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://example.com",
        data: {
          type: "scratch-gui-ready",
          nonce: "nonce-1",
        },
      }),
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://example.com",
        data: {
          type: "scratch-gui-ready",
          nonce: "nonce-1",
        },
      }),
    );
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://example.com",
        data: {
          type: "scratch-gui-ready",
          nonce: "nonce-2",
        },
      }),
    );

    expect(scratchIframeUtils.postMessageToScratchIframe).toHaveBeenCalledTimes(
      2,
    );
    expect(
      scratchIframeUtils.postMessageToScratchIframe,
    ).toHaveBeenNthCalledWith(1, {
      type: "scratch-gui-set-token",
      nonce: "nonce-1",
      accessToken: "token-123",
    });
    expect(
      scratchIframeUtils.postMessageToScratchIframe,
    ).toHaveBeenNthCalledWith(2, {
      type: "scratch-gui-set-token",
      nonce: "nonce-2",
      accessToken: "token-123",
    });
  });
});
