import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyScratchProjectIdentifierUpdate } from "../../../redux/EditorSlice";
import {
  subscribeToScratchProjectIdentifierUpdates,
  postMessageToScratchIframe,
} from "../../../utils/scratchIframe";

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
    <iframe
      src={iframeSrcUrl}
      title={"Scratch"}
      style={{
        width: "100%",
        height: "100%",
        border: 0,
        display: "block",
      }}
    />
  );
}
