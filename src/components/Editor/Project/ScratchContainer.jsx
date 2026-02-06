import React from "react";

const iFrame = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Scratch</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
  <script src="${process.env.ASSETS_URL}/scratch.js"></script>
</html>`;

export default function ScratchContainer() {
  return (
    <iframe
      srcDoc={iFrame}
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
