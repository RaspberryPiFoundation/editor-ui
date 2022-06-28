import { Workspace } from "@qualified/codemirror-workspace";

const workspace = new Workspace({
  // Project root. Required.
  rootUri: "file:///workspace/",

  // Provide language associaton (language id and server ids) for URI. Required.
  getLanguageAssociation: (uri) => {
    // javascript, javascriptreact, typescript, typescriptreact
    // if (/\.(?:[jt]sx?)$/.test(uri)) {
    //   const languageId = /\.tsx?$/.test(uri) ? "typescript" : "javascript";
    //   return {
    //     languageId: languageId + (uri.endsWith("x") ? "react" : ""),
    //     languageServerIds: ["typescript-language-server"],
    //   };
    // }

    // const styles = uri.match(/\.(css|less|s[ac]ss)$/);
    // if (styles !== null) {
    //   return {
    //     languageId: styles[1],
    //     languageServerIds: ["css-language-server"],
    //   };
    // }

    // if (uri.endsWith(".html")) {
    //   return {
    //     languageId: "html",
    //     languageServerIds: ["html-language-server"],
    //   };
    // }

    if (uri.endsWith(".json")) {
      return {
        languageId: "json",
        languageServerIds: ["json-worker"],
      };
    }

    // if (uri.endsWith(".py")) {
    //   return {
    //     languageId: "python",
    //     languageServerIds: ["python-language-server"]
    //   }
    // }

    // Return null to let the workspace ignore this file.
    return null;
  },

  // Provide the server's connection string. Required.
  // The returned string can be a URI of WebSocket proxy or
  // a location of Worker script to start Language Server.
  getConnectionString: async (langserverId) => {
    switch (langserverId) {
      case "typescript-language-server":
        // Use some API to start remote Language Server and return a string.
        const res = await fetch("/start", { method: "POST" });
        return res.json().uri;

      case "css-language-server":
        // Return an endpoint of already running proxy.
        return "ws://localhost:9991";

      case "html-language-server":
        return "ws://localhost:9992";

      case "json-worker":
        // Return a location of a script to start Language Server in Web Worker.
        return "./LSPWorker.js";

      // case "python-language-server":
      //   return "./LSPWorker.js"

      default:
        return "";
    }
  },

  // // Optional function to return HTML string from Markdown.
  // renderMarkdown: (markdown: string): string => markdown,
});
// // Open text document in workspace to enable code intelligence.
// // `cm` is CodeMirror.Editor instance with contents of the file.
// workspace.openTextDocument("example.json", document.querySelector(".cm-editor"));

export default workspace
