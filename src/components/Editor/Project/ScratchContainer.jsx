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

  const lastScratchTokenNonceRef = useRef(null);

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

    const handleScratchMessage = (event) => {
      if (event.origin !== allowedOrigin) return;
      if (event.data?.type !== "scratch-gui-ready") return;
      if (!event.data?.nonce) return;
      if (lastScratchTokenNonceRef.current === event.data.nonce) return;

      lastScratchTokenNonceRef.current = event.data.nonce;
      postMessageToScratchIframe({
        type: "scratch-gui-set-token",
        nonce: event.data.nonce,
        accessToken: accessToken || null,
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
