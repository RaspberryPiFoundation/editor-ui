import React from "react";
import { useSelector } from "react-redux";

export default function ScratchContainer() {
  const projectIdentifier = useSelector(
    (state) => state.editor.project.identifier,
  );
  const scratchApiEndpoint = useSelector(
    (state) => state.editor.scratchApiEndpoint,
  );

  const queryParams = new URLSearchParams();
  queryParams.set("project_id", projectIdentifier);
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
