import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyScratchProjectIdentifierUpdate } from "../../../redux/EditorSlice";
import { subscribeToScratchProjectIdentifierUpdates } from "../../../utils/scratchIframe";

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
