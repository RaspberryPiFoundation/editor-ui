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
  const defaultEditorState = {
    project: {
      identifier: "project-123",
      project_type: "code_editor_scratch",
    },
    scratchIframeProjectIdentifier: "project-123",
    scratchApiEndpoint: "https://api.example.com/v1",
  };

  const buildStore = ({ authReducer } = {}) =>
    configureStore({
      reducer: {
        editor: EditorReducer,
        ...(authReducer ? { auth: authReducer } : {}),
      },
      preloadedState: {
        editor: defaultEditorState,
      },
    });

  const renderScratchContainer = (store) =>
    render(
      <Provider store={store}>
        <ScratchContainer />
      </Provider>,
    );

  const dispatchMessage = (data, origin = "https://example.com") => {
    window.dispatchEvent(
      new MessageEvent("message", {
        origin,
        data,
      }),
    );
  };

  const dispatchScratchGuiReady = ({ nonce }) => {
    dispatchMessage({
      type: "scratch-gui-ready",
      nonce,
    });
  };

  const expectScratchSetTokenCall = ({
    callIndex,
    nonce,
    accessToken,
    requiresAuth,
  }) => {
    expect(
      scratchIframeUtils.postMessageToScratchIframe,
    ).toHaveBeenNthCalledWith(callIndex, {
      type: "scratch-gui-set-token",
      nonce,
      accessToken,
      requiresAuth,
    });
  };

  let originalAssetsUrl;

  beforeEach(() => {
    originalAssetsUrl = process.env.ASSETS_URL;
    process.env.ASSETS_URL = "https://example.com";
    localStorage.clear();
  });

  afterEach(() => {
    process.env.ASSETS_URL = originalAssetsUrl;
    jest.clearAllMocks();
  });

  test("renders iframe with src built from project_id and api_url", () => {
    const store = buildStore();
    renderScratchContainer(store);

    const iframe = screen.getByTitle("Scratch");
    expect(iframe).toBeInTheDocument();

    const url = new URL(iframe.getAttribute("src"));
    expect(url.pathname).toBe("/scratch.html");
    expect(url.searchParams.get("project_id")).toBe("project-123");
    expect(url.searchParams.get("api_url")).toBe("https://api.example.com/v1");
  });

  test("updates the parent project identifier without reloading the iframe project_id", async () => {
    const store = buildStore();
    renderScratchContainer(store);

    await act(async () => {
      dispatchMessage({
        type: "scratch-gui-project-id-updated",
        projectId: "project-456",
      });
    });

    expect(store.getState().editor.project.identifier).toBe("project-456");
    expect(store.getState().editor.scratchIframeProjectIdentifier).toBe(
      "project-123",
    );

    const url = new URL(screen.getByTitle("Scratch").getAttribute("src"));
    expect(url.searchParams.get("project_id")).toBe("project-123");
  });

  test("sends scratch-gui-set-token when scratch-gui-ready message is received", () => {
    const store = buildStore({
      authReducer: (state = { user: { access_token: "token-123" } }) => state,
    });
    renderScratchContainer(store);

    dispatchScratchGuiReady({ nonce: "nonce-abc" });

    expectScratchSetTokenCall({
      callIndex: 1,
      nonce: "nonce-abc",
      accessToken: "token-123",
      requiresAuth: false,
    });
  });

  test("does not resend token for duplicate nonce but sends for a new nonce", () => {
    const store = buildStore({
      authReducer: (state = { user: { access_token: "token-123" } }) => state,
    });
    renderScratchContainer(store);

    dispatchScratchGuiReady({ nonce: "nonce-1" });
    dispatchScratchGuiReady({ nonce: "nonce-1" });
    dispatchScratchGuiReady({ nonce: "nonce-2" });

    expect(scratchIframeUtils.postMessageToScratchIframe).toHaveBeenCalledTimes(
      2,
    );
    expectScratchSetTokenCall({
      callIndex: 1,
      nonce: "nonce-1",
      accessToken: "token-123",
      requiresAuth: false,
    });
    expectScratchSetTokenCall({
      callIndex: 2,
      nonce: "nonce-2",
      accessToken: "token-123",
      requiresAuth: false,
    });
  });

  test("resends the same nonce once access token becomes available when auth is expected", async () => {
    localStorage.setItem("authKey", "oidc.user:test");
    const store = buildStore({
      authReducer: (state = { user: null }, action) => {
        if (action.type === "test/setAuthToken") {
          return {
            user: { access_token: action.payload },
          };
        }
        return state;
      },
    });

    renderScratchContainer(store);
    dispatchScratchGuiReady({ nonce: "nonce-1" });

    expect(scratchIframeUtils.postMessageToScratchIframe).toHaveBeenCalledTimes(
      1,
    );
    expectScratchSetTokenCall({
      callIndex: 1,
      nonce: "nonce-1",
      accessToken: null,
      requiresAuth: true,
    });

    await act(async () => {
      store.dispatch({
        type: "test/setAuthToken",
        payload: "token-123",
      });
    });

    dispatchScratchGuiReady({ nonce: "nonce-1" });

    expect(scratchIframeUtils.postMessageToScratchIframe).toHaveBeenCalledTimes(
      2,
    );
    expectScratchSetTokenCall({
      callIndex: 2,
      nonce: "nonce-1",
      accessToken: "token-123",
      requiresAuth: true,
    });
  });
});
