import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { matchMedia } from "mock-match-media";
import HtmlRenderer from "./HtmlRenderer";
import {
  MSG_HTML_PREVIEW_READY,
  MSG_HTML_PROJECT_UPDATE,
} from "../../../../utils/iframeUtils";

let mockMediaQuery = (query) => {
  return matchMedia(query).matches;
};

jest.mock("react-responsive", () => ({
  ...jest.requireActual("react-responsive"),
  useMediaQuery: ({ query }) => mockMediaQuery(query),
}));

const indexPage = {
  name: "index",
  extension: "html",
  content: "<head></head><body><p>hello world</p></body>",
};

const newTabLinkHTMLPage = {
  name: "some_file",
  extension: "html",
  content:
    '<head></head><body><a href="index.html" target="_blank">NEW TAB LINK!</a></body>',
};

const internalLinkHTMLPage = {
  name: "internal_link",
  extension: "html",
  content: '<head></head><body><a href="test.html">ANCHOR LINK!</a></body>',
};

const internalLinkTargetHTMLPage = {
  name: "test",
  extension: "html",
  content: "<p>test file</p>",
};

const mediaProject = {
  components: [
    {
      name: "index",
      extension: "html",
      content:
        '<head></head><body><img src="image.jpeg" /><video src="video.mp4" /><audio src="audio.mp3" /></body>',
    },
  ],
  image_list: [
    {
      filename: "image.jpeg",
      url: "https://example.com/image.jpeg",
    },
  ],
  videos: [
    {
      filename: "video.mp4",
      url: "https://example.com/video.mp4",
    },
  ],
  audio: [
    {
      filename: "audio.mp3",
      url: "https://example.com/audio.mp3",
    },
  ],
};

const allowedExternalLink = {
  name: "allowed_external_link",
  extension: "html",
  content:
    '<head></head><body><a href="https://rpf.io/seefood">RPF link</a></body>',
};

const forbiddenExternalLinkHTMLPage = {
  name: "forbidded_external_link",
  extension: "html",
  content:
    '<head></head><body><a href="https://google.test/">EXTERNAL LINK!</a></body>',
};

describe("When run is triggered", () => {
  beforeEach(async () => {
    let ready = false;

    const onMessage = (event) => {
      if (event.data?.type === MSG_HTML_PREVIEW_READY) {
        ready = true;
      }
    };
    window.addEventListener("message", onMessage);

    render(<HtmlRenderer />);

    await waitFor(() => {
      expect(ready).toBe(true);
    });

    window.removeEventListener("message", onMessage);
  });

  describe("When basic HTML is rendered", () => {
    beforeEach(() => {
      window.postMessage(
        {
          type: MSG_HTML_PROJECT_UPDATE,
          code: [],
          media: [],
          current: indexPage.content,
        },
        "*",
      );
    });

    test("Runs HTML code", async () => {
      const iframe = screen.getByTitle("preview-sandbox");

      await waitFor(() => {
        expect(iframe.getAttribute("srcdoc")).toContain("hello world");
      });
    });
  });

  describe("When a non-permitted external link is rendered", () => {
    beforeEach(() => {
      window.postMessage(
        {
          type: MSG_HTML_PROJECT_UPDATE,
          code: [forbiddenExternalLinkHTMLPage],
          media: [],
          current: forbiddenExternalLinkHTMLPage.content,
        },
        "*",
      );
    });

    test("Transforms the external link and includes the meta tag", async () => {
      const iframe = screen.getByTitle("preview-sandbox");

      await waitFor(() => {
        expect(iframe.getAttribute("srcdoc")).toContain(
          '<a href="javascript:void(0)"',
        );
        expect(iframe.getAttribute("srcdoc")).toContain(
          `onclick="window.parent.postMessage({type: 'editor-html-event', msg: 'ERROR: External link'}, '${process.env.HTML_RENDERER_URL}')"`,
        );
        expect(iframe.getAttribute("srcdoc")).toContain("EXTERNAL LINK!");
      });
    });
  });

  describe("When a new tab link is rendered", () => {
    beforeEach(() => {
      window.postMessage(
        {
          type: MSG_HTML_PROJECT_UPDATE,
          code: [indexPage, newTabLinkHTMLPage],
          media: [],
          current: newTabLinkHTMLPage.content,
        },
        "*",
      );
    });

    test("Removes target attribute and adds onclick event", async () => {
      const iframe = screen.getByTitle("preview-sandbox");

      await waitFor(() => {
        expect(iframe.getAttribute("srcdoc")).not.toContain('target="_blank"');
        expect(iframe.getAttribute("srcdoc")).toContain(
          '<a href="javascript:void(0)"',
        );
        expect(iframe.getAttribute("srcdoc")).toContain(
          `onclick="window.parent.postMessage({type: 'editor-html-event', msg: 'RELOAD', payload: { linkTo: 'index' }}, '${process.env.HTML_RENDERER_URL}')"`,
        );
        expect(iframe.getAttribute("srcdoc")).toContain("NEW TAB LINK!");
      });
    });
  });

  describe("When an internal link is rendered", () => {
    beforeEach(() => {
      window.postMessage(
        {
          type: MSG_HTML_PROJECT_UPDATE,
          code: [internalLinkTargetHTMLPage, internalLinkHTMLPage],
          media: [],
          current: internalLinkHTMLPage.content,
        },
        "*",
      );
    });

    test("Transforms internal link", async () => {
      const iframe = screen.getByTitle("preview-sandbox");

      await waitFor(() => {
        expect(iframe.getAttribute("srcdoc")).toContain(
          '<a href="javascript:void(0)"',
        );
        expect(iframe.getAttribute("srcdoc")).toContain(
          `onclick="window.parent.postMessage({type: 'editor-html-event', msg: 'RELOAD', payload: { linkTo: 'test' }}, '${process.env.HTML_RENDERER_URL}')`,
        );
        expect(iframe.getAttribute("srcdoc")).toContain("ANCHOR LINK!");
      });
    });
  });

  describe("When an allowed external link is rendered", () => {
    beforeEach(() => {
      window.postMessage(
        {
          type: MSG_HTML_PROJECT_UPDATE,
          code: [allowedExternalLink],
          media: [],
          current: allowedExternalLink.content,
        },
        "*",
      );
    });

    test("Transforms allowed external link and includes meta tag", async () => {
      const iframe = screen.getByTitle("preview-sandbox");

      await waitFor(() => {
        expect(iframe.getAttribute("srcdoc")).toContain(
          '<a href="https://rpf.io/seefood"',
        );
        expect(iframe.getAttribute("srcdoc")).toContain(
          `onclick="window.parent.postMessage({type: 'editor-html-event', msg: 'Allowed external link', payload: { linkTo: 'https://rpf.io/seefood' }}, '${process.env.HTML_RENDERER_URL}')`,
        );
        expect(iframe.getAttribute("srcdoc")).toContain("RPF link");
      });
    });
  });

  describe("When media is rendered", () => {
    beforeEach(() => {
      window.postMessage(
        {
          type: MSG_HTML_PROJECT_UPDATE,
          code: [mediaProject.components],
          media: [
            ...(mediaProject.image_list || []),
            ...(mediaProject.audio || []),
            ...(mediaProject.videos || []),
          ],
          current: mediaProject.components[0].content,
        },
        "*",
      );
    });

    test("Transforms image sources", async () => {
      const iframe = screen.getByTitle("preview-sandbox");

      await waitFor(() => {
        expect(iframe.getAttribute("srcdoc")).toContain(
          '<img src="https://example.com/image.jpeg"',
        );
      });
    });

    test("Transforms video sources", async () => {
      const iframe = screen.getByTitle("preview-sandbox");
      await waitFor(() => {
        expect(iframe.getAttribute("srcdoc")).toContain(
          '<video src="https://example.com/video.mp4"',
        );
      });
    });

    test("Transforms audio sources", async () => {
      const iframe = screen.getByTitle("preview-sandbox");

      await waitFor(() => {
        expect(iframe.getAttribute("srcdoc")).toContain(
          '<audio src="https://example.com/audio.mp3"',
        );
      });
    });
  });
});
