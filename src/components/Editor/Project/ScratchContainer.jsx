import React from "react";

export default function ScratchContainer() {
  return (
    <iframe
      src={`${process.env.ASSETS_URL}/scratch.html`}
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
