import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClickScrollPlugin, OverlayScrollbars } from "overlayscrollbars";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { applyScratchProjectIdentifierUpdate } from "../../../redux/EditorSlice";
import {
  subscribeToScratchProjectIdentifierUpdates,
  postMessageToScratchIframe,
} from "../../../utils/scratchIframe";

const SCRATCH_MIN_WIDTH = 1024;
const SCRATCH_SCROLLBAR_OPTIONS = {
  overflow: {
    x: "scroll",
    y: "hidden",
  },
  scrollbars: {
    theme: "os-theme-scratch",
    visibility: "auto",
    clickScroll: "instant",
  },
};

OverlayScrollbars.plugin(ClickScrollPlugin);

export default function ScratchContainer() {
  const dispatch = useDispatch();
  const projectIdentifier = useSelector(
    (state) => state.editor.project.identifier,
  );
  const scratchIframeProjectIdentifier = useSelector(
    (state) => state.editor.scratchIframeProjectIdentifier,
  );
  const scratchApiEndpoint = useSelector(
    (state) => state.editor.scratchApiEndpoint,
  );
  const accessToken = useSelector((state) => state.auth?.user?.access_token);
  const iframeProjectIdentifier =
    scratchIframeProjectIdentifier || projectIdentifier;

  const lastScratchTokenStateRef = useRef({
    nonce: null,
    hadAccessToken: false,
  });

  useEffect(() => {
    return subscribeToScratchProjectIdentifierUpdates(
      (nextProjectIdentifier) => {
        dispatch(
          applyScratchProjectIdentifierUpdate({
            projectIdentifier: nextProjectIdentifier,
          }),
        );
      },
    );
  }, [dispatch]);

  useEffect(() => {
    const allowedOrigin = process.env.ASSETS_URL || window.location.origin;
    const authKey = localStorage.getItem("authKey");
    const requiresAuth = Boolean(
      authKey && authKey !== "undefined" && authKey !== "null",
    );

    const handleScratchMessage = (event) => {
      if (event.origin !== allowedOrigin) return;
      if (event.data?.type !== "scratch-gui-ready") return;
      if (!event.data?.nonce) return;
      const hasAccessToken = Boolean(accessToken);
      const previousHandshake = lastScratchTokenStateRef.current;
      const isSameNonce = previousHandshake.nonce === event.data.nonce;
      const shouldSkipDuplicateNonce =
        isSameNonce && (previousHandshake.hadAccessToken || !hasAccessToken);

      if (shouldSkipDuplicateNonce) return;

      lastScratchTokenStateRef.current = {
        nonce: event.data.nonce,
        hadAccessToken: hasAccessToken,
      };
      postMessageToScratchIframe({
        type: "scratch-gui-set-token",
        nonce: event.data.nonce,
        accessToken: accessToken || null,
        requiresAuth,
      });
    };

    window.addEventListener("message", handleScratchMessage);
    return () => {
      window.removeEventListener("message", handleScratchMessage);
    };
  }, [accessToken]);

  const queryParams = new URLSearchParams();
  queryParams.set("project_id", iframeProjectIdentifier);
  queryParams.set("api_url", scratchApiEndpoint);
  queryParams.set("scratchMetadata", "1");
  queryParams.set("parent_origin", window.location.origin);

  const iframeSrcUrl = `${
    process.env.ASSETS_URL
  }/scratch.html?${queryParams.toString()}`;

  return (
    <div className="scratch-container" data-testid="scratch-container">
      <OverlayScrollbarsComponent
        className="scratch-container__viewport"
        data-testid="scratch-container-viewport"
        options={SCRATCH_SCROLLBAR_OPTIONS}
      >
        <iframe
          className="scratch-container__iframe"
          src={iframeSrcUrl}
          title={"Scratch"}
          style={{
            width: "100%",
            minWidth: `${SCRATCH_MIN_WIDTH}px`,
            border: 0,
            display: "block",
          }}
        />
      </OverlayScrollbarsComponent>
    </div>
  );
}
