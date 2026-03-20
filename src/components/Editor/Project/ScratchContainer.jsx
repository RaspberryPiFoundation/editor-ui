import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyScratchProjectIdentifierUpdate } from "../../../redux/EditorSlice";

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
  const iframeProjectIdentifier =
    scratchIframeProjectIdentifier || projectIdentifier;

  useEffect(() => {
    const allowedOrigin = process.env.ASSETS_URL || window.location.origin;
    const handleScratchMessage = ({ origin, data }) => {
      if (origin !== allowedOrigin) return;
      if (data?.type !== "scratch-gui-project-id-updated") return;
      if (!data.projectId) return;

      dispatch(
        applyScratchProjectIdentifierUpdate({
          projectIdentifier: data.projectId,
        }),
      );
    };

    window.addEventListener("message", handleScratchMessage);
    return () => window.removeEventListener("message", handleScratchMessage);
  }, [dispatch]);

  const queryParams = new URLSearchParams();
  queryParams.set("project_id", iframeProjectIdentifier);
  queryParams.set("api_url", scratchApiEndpoint);

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
