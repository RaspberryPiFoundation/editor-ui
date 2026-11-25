// Running code: Run/Stop controls, the HTML preview and the Python runners.

import { always, eventually, now } from "@antithesishq/bombadil";
import {
  actions,
  extract,
  registerCustomAction,
  weighted,
} from "@antithesishq/bombadil/browser";
import {
  activeCmContent,
  clickButton,
  cmView,
  editorHost,
  editorMatchesSelectedTab,
  enabledRunButton,
  outputShowsRenderer,
  recordFailure,
  runPhases,
  sleep,
  waitFor,
} from "./lib/dom.ts";
import { oracleProperty } from "./lib/oracles.ts";

const runner = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  if (!root) return null;
  const buttons = Array.from(
    root.querySelectorAll(".runner-controls button"),
  ) as HTMLButtonElement[];
  const toggle = root.querySelector(
    ".output-view-toggle__button",
  ) as HTMLButtonElement | null;
  const outer = root.querySelector("#output-frame") as HTMLIFrameElement | null;
  // Where the output frame was pointed (its src), and where the user's
  // preview inside it currently is.
  let outerSrc: string | null = null;
  let outerSrcOrigin: string | null = null;
  let showsRenderer = false;
  let innerHref: string | null = null;
  if (outer) {
    outerSrc = outer.getAttribute("src");
    try {
      const url = new URL(outerSrc ?? "", state.window.location.href);
      outerSrcOrigin = url.origin;
      showsRenderer = url.pathname.endsWith("/html-renderer.html");
    } catch {
      outerSrcOrigin = "<invalid>";
    }
    try {
      const inner = outer.contentDocument?.querySelector(
        "iframe.htmlrunner-iframe",
      ) as HTMLIFrameElement | null;
      innerHref = inner?.contentWindow?.location.href ?? null;
    } catch {
      innerHref = "<cross-origin>";
    }
  }
  // Sticky per page load: the Run button has been enabled at least once,
  // so the runtime (e.g. Pyodide, downloaded on first use) has loaded.
  const w = state.window as any;
  if (enabledRunButton(root)) w.__bombadilRuntimeLoaded = true;
  return {
    runtimeLoaded: !!w.__bombadilRuntimeLoaded,
    isHtml: !!root.querySelector('[data-testid="html-runner-container"]'),
    isPython: !!root.querySelector(".pythonrunner-container"),
    phases: runPhases(root),
    disabled: buttons.map((b) => b.disabled),
    toggleDisabled: toggle ? toggle.disabled : null,
    openInputs: root.querySelectorAll(
      '.pythonrunner-input[contenteditable="true"]',
    ).length,
    errorShown: !!root.querySelector(".error-message__error"),
    errorLines: root.querySelectorAll(".cm-error-line").length,
    outputFrames: root.querySelectorAll("#output-frame").length,
    pageOrigin: state.window.location.origin,
    outerSrc,
    outerSrcOrigin,
    showsRenderer,
    innerHref,
  };
});

const isRunning = (phase: string) => phase !== "idle";

/**
 * All Run/Stop controls agree on idle vs running, Stop is never disabled,
 * and the output view toggle is disabled exactly while code runs.
 * (Stop vs "Stopping..." can differ per control for 100ms, so only
 * idle vs running is compared.)
 */
export const runControlsCoherent = always(() => {
  const s = runner.current;
  if (!s || s.phases.length === 0) return true;
  const running = isRunning(s.phases[0]);
  return (
    s.phases.every((p) => isRunning(p) === running) &&
    s.phases.every((p, i) => !isRunning(p) || !s.disabled[i]) &&
    (s.toggleDisabled === null || s.toggleDisabled === running)
  );
});

// HTML

/** An HTML run completes synchronously once the renderer is ready. */
export const htmlRunNeverStuckRunning = always(
  now(
    () => !!runner.current?.isHtml && runner.current.phases.some(isRunning),
  ).implies(
    eventually(
      () => !runner.current?.isHtml || !runner.current.phases.some(isRunning),
    ).within(10, "seconds"),
  ),
);

/** Once mounted and idle, the HTML Run button becomes enabled. */
export const htmlRunButtonEventuallyEnabled = always(
  now(() => {
    const s = runner.current;
    return (
      !!s &&
      s.isHtml &&
      s.phases.length > 0 &&
      !s.phases.some(isRunning) &&
      s.disabled.every(Boolean)
    );
  }).implies(
    eventually(() => {
      const s = runner.current;
      return (
        !s ||
        !s.isHtml ||
        s.phases.some(isRunning) ||
        !s.disabled.every(Boolean)
      );
    }).within(3, "seconds"),
  ),
);

// Origins the output frame may be pointed at: the editor itself (the
// renderer, or an allowed link back to the editor's host) and rpf.io short
// links. See src/utils/externalLinkHelper.js.
const ALLOWED_OUTPUT_ORIGINS = ["https://rpf.io"];

/**
 * Links in the preview never take the output somewhere it shouldn't go.
 * The output frame only points at the editor's own origin or rpf.io, and
 * while it shows the renderer, the user's page stays in its srcdoc iframe
 * (an in-page #anchor must not load another document there).
 */
export const htmlPreviewStaysInsideRenderer = always(() => {
  const s = runner.current;
  if (!s || !s.isHtml || s.outerSrc === null) return true;
  const outerOk =
    s.outerSrcOrigin === s.pageOrigin ||
    ALLOWED_OUTPUT_ORIGINS.includes(s.outerSrcOrigin ?? "");
  const innerOk =
    !s.showsRenderer ||
    s.innerHref === null ||
    s.innerHref.startsWith("about:");
  return s.outputFrames <= 1 && outerOk && innerOk;
});

/**
 * Write a unique marker into the focused .html file, press Run, and check
 * that the preview shows it and that `editor-runCompleted` fires.
 */
const runHtmlWithMarker = registerCustomAction(
  "runHtmlWithMarker",
  async (document, window, variant: string) => {
    const root = editorHost(document)?.shadowRoot as ShadowRoot | null;
    const content = activeCmContent(root);
    if (!root || !content) return;
    if (!/\.html editor$/.test(content.getAttribute("aria-label") ?? ""))
      return;
    if (content.getAttribute("contenteditable") !== "true") return;
    if (!editorMatchesSelectedTab(root)) return;
    const view = cmView(content);
    const runButton = enabledRunButton(root);
    if (!view || !runButton) return;

    const w = window as any;
    // Once the output frame has left the renderer (a known bug, recorded
    // below the first time), every further run would wait out the timeout.
    if (
      !outputShowsRenderer(root, window) &&
      (w.__bombadilFailures?.htmlPreviewShowsLatestCode?.length ?? 0) > 0
    ) {
      return;
    }
    if (!w.__bombadilRunCompleted) {
      w.__bombadilRunCompleted = { count: 0 };
      document.addEventListener("editor-runCompleted", () => {
        w.__bombadilRunCompleted.count++;
      });
    }

    const token = `bmb${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 7)}`;
    // "links" adds an in-page anchor and an external link. External links
    // should be rewritten to show the "links to external sites" modal.
    const links =
      variant === "links"
        ? '<a id="bmbanchorlink" href="#bmbanchor">anchor</a> ' +
          '<a id="bmbext" href="https://example.com/">external</a>' +
          '<span id="bmbanchor"></span>'
        : variant === "lookalike"
          ? // Starts with the allowed "http://localhost:3011" prefix, but the
            // host is example.com.
            '<a id="bmbext" href="http://localhost:3011@example.com/">' +
            "lookalike</a>"
          : "";
    const tokenElement = `<p data-bombadil-token="${token}">${token}</p>`;
    const block = `<!--bmb-->${tokenElement}${links}<!--/bmb-->`;
    const doc: string = view.state.doc.toString();
    const start = doc.indexOf("<!--bmb-->");
    const end = doc.indexOf("<!--/bmb-->");
    const bodyEnd = doc.lastIndexOf("</body>");
    view.dispatch({
      changes:
        start >= 0 && end > start
          ? { from: start, to: end + "<!--/bmb-->".length, insert: block }
          : { from: bodyEnd >= 0 ? bodyEnd : doc.length, insert: block },
    });
    await sleep(50);

    // Earlier random edits can leave the marker inside an unclosed comment
    // or a <script>/<textarea>, where it can never render. Only judge the
    // preview when the browser would parse the token as an element.
    const renderable = !!new DOMParser()
      .parseFromString(view.state.doc.toString(), "text/html")
      .querySelector(`[data-bombadil-token="${token}"]`);

    const completedBefore = w.__bombadilRunCompleted.count;
    clickButton(enabledRunButton(root) ?? runButton);

    const previewToken = () => {
      try {
        const outer = root.querySelector(
          "#output-frame",
        ) as HTMLIFrameElement | null;
        const inner = outer?.contentDocument?.querySelector(
          "iframe.htmlrunner-iframe",
        ) as HTMLIFrameElement | null;
        return (
          inner?.contentDocument
            ?.querySelector("[data-bombadil-token]")
            ?.getAttribute("data-bombadil-token") ?? null
        );
      } catch {
        return null;
      }
    };
    // The first run mounts the renderer iframe, which Vite may compile on
    // demand, so allow some time.
    if (
      renderable &&
      !(await waitFor(() => previewToken() === token, 10_000))
    ) {
      recordFailure(
        window,
        "htmlPreviewShowsLatestCode",
        `preview shows ${previewToken()} after running ${token}`,
      );
    }
    if (
      !(await waitFor(
        () => w.__bombadilRunCompleted.count > completedBefore,
        3_000,
      ))
    ) {
      recordFailure(
        window,
        "htmlRunEmitsRunCompleted",
        `no editor-runCompleted event after running ${token}`,
      );
    }
  },
);

/** Click one of the links that `runHtmlWithMarker` put in the preview. */
const clickPreviewLink = registerCustomAction(
  "clickPreviewLink",
  async (document, _window, id: string) => {
    const outer = editorHost(document)?.shadowRoot?.querySelector(
      "#output-frame",
    ) as HTMLIFrameElement | null;
    const inner = outer?.contentDocument?.querySelector(
      "iframe.htmlrunner-iframe",
    ) as HTMLIFrameElement | null;
    (inner?.contentDocument?.getElementById(id) as HTMLElement | null)?.click();
  },
);

export const htmlPreviewShowsLatestCode = oracleProperty(
  "htmlPreviewShowsLatestCode",
);
export const htmlRunEmitsRunCompleted = oracleProperty(
  "htmlRunEmitsRunCompleted",
);

// Mirrors the guards at the top of runHtmlWithMarker, so the action isn't
// offered when it would return without doing anything.
const htmlEditorReady = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  const content = activeCmContent(root);
  const failures = (state.window as any).__bombadilFailures;
  const stuckOutputRecorded =
    !!root &&
    !outputShowsRenderer(root, state.window) &&
    (failures?.htmlPreviewShowsLatestCode?.length ?? 0) > 0;
  return (
    !!root &&
    /\.html editor$/.test(content?.getAttribute("aria-label") ?? "") &&
    content?.getAttribute("contenteditable") === "true" &&
    editorMatchesSelectedTab(root) &&
    !!enabledRunButton(root) &&
    !stuckOutputRecorded
  );
});

const previewLinks = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  // An open dialog's overlay blocks clicks on the preview for real users.
  if (!root || root.querySelector(".ReactModal__Overlay")) return [];
  try {
    const outer = root.querySelector(
      "#output-frame",
    ) as HTMLIFrameElement | null;
    const doc = (
      outer?.contentDocument?.querySelector(
        "iframe.htmlrunner-iframe",
      ) as HTMLIFrameElement | null
    )?.contentDocument;
    return ["bmbanchorlink", "bmbext"].filter(
      (id) => !!doc?.getElementById(id),
    );
  } catch {
    return [];
  }
});

const htmlActions = weighted([
  [
    5,
    actions(() =>
      htmlEditorReady.current
        ? [runHtmlWithMarker("plain"), runHtmlWithMarker("links")]
        : [],
    ),
  ],
  [
    1,
    actions(() =>
      htmlEditorReady.current ? [runHtmlWithMarker("lookalike")] : [],
    ),
  ],
  [3, actions(() => previewLinks.current.map((id) => clickPreviewLink(id)))],
]);

// Python

/**
 * An editable input() prompt only exists while a program runs, and there is
 * never more than one.
 */
export const inputPromptOnlyWhileRunning = always(() => {
  const s = runner.current;
  if (!s || !s.isPython) return true;
  if (s.openInputs > 1) return false;
  return s.openInputs === 0 || s.phases.some(isRunning);
});

/**
 * Pressing Stop returns the editor to idle. Only checked once the runtime
 * has loaded: the host page's "Run code" button can start a run before
 * Pyodide has downloaded, and Stop then waits for the download.
 */
export const stopEventuallyReturnsToRun = always(
  now(() => {
    const s = runner.current;
    return (
      !!s && s.isPython && s.runtimeLoaded && s.phases.includes("stopping")
    );
  }).implies(
    eventually(() => {
      const s = runner.current;
      return !s || s.phases.length === 0 || s.phases.every((p) => p === "idle");
    }).within(30, "seconds"),
  ),
);

/**
 * At most one line is highlighted as an error, and a highlighted line only
 * stays while an error message is shown. (Starting a run clears the
 * message in the render and the highlight in a later effect, hence the
 * short grace period.)
 */
const errorLineWithoutMessage = () => {
  const s = runner.current;
  return !!s && s.isPython && s.errorLines > 0 && !s.errorShown;
};
export const errorLineImpliesErrorShown = always(
  now(() => (runner.current?.errorLines ?? 0) <= 1).and(
    now(errorLineWithoutMessage).implies(
      eventually(() => !errorLineWithoutMessage()).within(1, "seconds"),
    ),
  ),
);

type PythonProgram = {
  code: string;
  output: RegExp;
  error?: RegExp;
  input?: string;
};

// Only imports `time`, so no switch between the Pyodide and Skulpt runners.
// Each run prints a fresh nonce, so output left over from an earlier run of
// the same program can't satisfy the check.
const PYTHON_PROGRAMS: Record<string, (nonce: string) => PythonProgram> = {
  ok: (n) => ({
    code: `print("bombadil-ok-${n}-" + str(6 * 7))\n`,
    output: new RegExp(`bombadil-ok-${n}-42`),
  }),
  error: (n) => ({
    code:
      `print("bombadil-before-error-${n}")\n` +
      "print(bombadil_undefined_name)\n",
    output: new RegExp(`bombadil-before-error-${n}`),
    error: /NameError.*line 2\b/s,
  }),
  input: (n) => ({
    code:
      'name = input("bombadil-name? ")\n' +
      `print("bombadil-hello-${n}-" + name)\n`,
    input: "bob",
    output: new RegExp(`bombadil-hello-${n}-bob`),
  }),
  slow: (n) => ({
    code:
      "from time import sleep\nfor i in range(4):\n" +
      '    print("bombadil-tick-" + str(i))\n    sleep(0.5)\n' +
      `print("bombadil-slow-done-${n}")\n`,
    output: new RegExp(`bombadil-slow-done-${n}`),
  }),
};

const ACTIVE_PYTHON_CONSOLE = [
  ".pyodiderunner--active .pythonrunner-console",
  ".skulptrunner--active .pythonrunner-console",
].join(", ");

function activePythonConsole(root: ShadowRoot): string {
  return root.querySelector(ACTIVE_PYTHON_CONSOLE)?.textContent ?? "";
}

/**
 * Write a known program into main.py and run it. With mode "check" the
 * action waits for the run to finish and checks the output, error and
 * input() prompt. With mode "start" it returns straight away, so random
 * actions (like Stop) interleave with the running program.
 */
const runPython = registerCustomAction(
  "runPython",
  async (document, window, kind: string, mode: string) => {
    const nonce = Math.random().toString(36).slice(2, 8);
    const program = PYTHON_PROGRAMS[kind]?.(nonce);
    const root = editorHost(document)?.shadowRoot as ShadowRoot | null;
    if (!program || !root) return;
    // Run is only enabled once the runtime has loaded.
    if (!enabledRunButton(root)) return;

    const mainTab = (
      Array.from(
        root.querySelectorAll('section.editor-input [role="tab"]'),
      ) as HTMLElement[]
    ).find((t) => t.textContent?.trim() === "main.py");
    if (!mainTab) return;
    if (mainTab.getAttribute("aria-selected") !== "true") {
      mainTab.click();
      await sleep(100);
    }
    const content = activeCmContent(root);
    if (content?.getAttribute("contenteditable") !== "true") return;
    if (!editorMatchesSelectedTab(root)) return;
    const view = cmView(content);
    if (!view) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: program.code },
    });
    await sleep(50);
    const runButton = enabledRunButton(root);
    if (!runButton) return;
    clickButton(runButton);
    if (mode !== "check") return;

    const idle = () => {
      const phases = runPhases(root);
      return phases.length > 0 && phases.every((p) => p === "idle");
    };
    const fail = (detail: string) =>
      recordFailure(window, "pythonRunsBehave", `${kind}: ${detail}`);

    // The controls switch to Stop on the next render, so wait for the run
    // to start (or, for a very fast program, to have already printed).
    const started = await waitFor(
      () => !idle() || program.output.test(activePythonConsole(root)),
      5_000,
    );
    if (!started) {
      fail("run never started after pressing Run");
      return;
    }

    if (program.input !== undefined) {
      const promptOpen = () =>
        !!root.querySelector('.pythonrunner-input[contenteditable="true"]');
      if (!(await waitFor(promptOpen, 10_000))) {
        fail("input() prompt never appeared");
        return;
      }
      const prompt = root.querySelector(
        '.pythonrunner-input[contenteditable="true"]',
      ) as HTMLElement;
      prompt.focus();
      prompt.innerText = program.input;
      const init = {
        key: "Enter",
        code: "Enter",
        keyCode: 13,
        which: 13,
        bubbles: true,
        composed: true,
      };
      prompt.dispatchEvent(new KeyboardEvent("keydown", init));
      prompt.dispatchEvent(new KeyboardEvent("keyup", init));
    }

    if (!(await waitFor(idle, 20_000))) {
      fail("still running after 20s");
      return;
    }
    // Pyodide batches output for 50ms and can finish just after the button.
    const outputOk = await waitFor(
      () => program.output.test(activePythonConsole(root)),
      1_000,
    );
    const errorText =
      root.querySelector(".error-message__error")?.textContent ?? "";
    if (!outputOk) {
      const got = activePythonConsole(root).slice(-200);
      fail(`expected output ${program.output}, got "${got}"`);
    }
    if (program.error ? !program.error.test(errorText) : errorText !== "") {
      fail(`unexpected error message "${errorText}"`);
    }
  },
);

export const pythonRunsBehave = oracleProperty("pythonRunsBehave");

const pythonReady = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  return (
    !!root &&
    !!root.querySelector(".pythonrunner-container") &&
    !root.querySelector(".editor-input__view-only-banner") &&
    !!enabledRunButton(root)
  );
});

/** Answer an open input() prompt (one left open by a random Run click). */
const answerInput = registerCustomAction(
  "answerInput",
  async (document, _window, text: string) => {
    const prompt = editorHost(document)?.shadowRoot?.querySelector(
      '.pythonrunner-input[contenteditable="true"]',
    ) as HTMLElement | null;
    if (!prompt) return;
    prompt.focus();
    prompt.innerText = text;
    const init = {
      key: "Enter",
      code: "Enter",
      keyCode: 13,
      which: 13,
      bubbles: true,
      composed: true,
    };
    prompt.dispatchEvent(new KeyboardEvent("keydown", init));
    prompt.dispatchEvent(new KeyboardEvent("keyup", init));
  },
);

const pythonActions = weighted([
  [
    4,
    actions(() =>
      pythonReady.current
        ? ["ok", "error", "input", "slow"].map((kind) =>
            runPython(kind, "check"),
          )
        : [],
    ),
  ],
  [
    2,
    actions(() =>
      pythonReady.current
        ? [runPython("slow", "start"), runPython("input", "start")]
        : [],
    ),
  ],
  [
    6,
    actions(() =>
      (runner.current?.openInputs ?? 0) > 0
        ? [answerInput("bob"), answerInput("")]
        : [],
    ),
  ],
]);

export const runnerActions = weighted([
  [1, htmlActions],
  [1, pythonActions],
]);
