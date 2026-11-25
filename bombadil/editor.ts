// Code editor: CodeMirror 6, file tabs, and the link between editor and store.

import { always, eventually, now } from "@antithesishq/bombadil";
import {
  actions,
  extract,
  getFingerprint,
  registerCustomAction,
  weighted,
} from "@antithesishq/bombadil/browser";
import {
  activeCmContent,
  clickablePoint,
  cmView,
  editorHost,
  inViewport,
  isVisible,
} from "./lib/dom.ts";

const MAIN_FILES = ["main.py", "index.html"];
const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  html: "html",
  css: "css",
  py: "python",
  js: "javascript",
};

export const editorUi = extract((state) => {
  const host = editorHost(state.document);
  const root: ShadowRoot | null = host?.shadowRoot ?? null;
  const section = root?.querySelector("section.editor-input");
  if (!root || !section) return null;

  const tabs = Array.from(section.querySelectorAll('[role="tab"]'));
  const names = tabs.map(
    (t) => t.querySelector(".react-tabs__tab-text")?.textContent?.trim() ?? "",
  );
  const selected = tabs.flatMap((t, i) =>
    t.getAttribute("aria-selected") === "true" ? [i] : [],
  );
  const closable = tabs.map(
    (t) => !!t.querySelector("button.react-tabs__tab-close-btn"),
  );
  const panel = section.querySelector(".react-tabs__tab-panel--selected");
  const content = activeCmContent(root);
  const view = cmView(content);
  const selectedName = selected.length === 1 ? names[selected[0]] : null;
  const stored = host.editorCode;

  return {
    names,
    selected,
    closable,
    editorCount: section.querySelectorAll(".cm-editor").length,
    editorsInSelectedPanel: panel
      ? panel.querySelectorAll(".cm-content").length
      : 0,
    label: content?.getAttribute("aria-label") ?? null,
    language: content?.getAttribute("data-language") ?? null,
    editable: content?.getAttribute("contenteditable") ?? null,
    focused: !!(root.activeElement as any)?.closest?.(".cm-content"),
    // editorCode returns the first component, which is the main file in
    // every fixture. Compare in the page so the document isn't serialised.
    docMatchesStore:
      view &&
      selectedName !== null &&
      MAIN_FILES.includes(selectedName) &&
      typeof stored === "string"
        ? view.state.doc.toString() === stored
        : null,
  };
});

/**
 * Exactly one file tab is selected, names are unique, at most one CodeMirror
 * is mounted, and only non-main files can be closed.
 */
export const fileTabsWellFormed = always(() => {
  const s = editorUi.current;
  if (!s || s.names.length === 0) return true;
  const unique = new Set(s.names).size === s.names.length;
  const closeRule = s.names.every((name, i) =>
    MAIN_FILES.includes(name) ? !s.closable[i] : s.closable[i],
  );
  return s.selected.length === 1 && unique && s.editorCount <= 1 && closeRule;
});

/**
 * The CodeMirror in the selected tab belongs to that file: its aria-label
 * names the file and its language matches the extension.
 */
export const activeEditorMatchesSelectedTab = always(() => {
  const s = editorUi.current;
  if (
    !s ||
    s.selected.length !== 1 ||
    s.editorCount !== 1 ||
    s.editorsInSelectedPanel !== 1
  ) {
    return true;
  }
  const name = s.names[s.selected[0]];
  const extension = name.split(".").slice(1).join(".");
  const languageOk =
    s.language === null ||
    s.language === (LANGUAGE_BY_EXTENSION[extension] ?? "html");
  // Locale-agnostic: compare the file name token in the label.
  const labelFile = s.label?.match(/[^\s"'“”«»()]+\.[A-Za-z0-9]+/)?.[0];
  return languageOk && (!labelFile || labelFile === name);
});

/** A selected tab gets its editor shortly after selection. */
export const selectedTabEventuallyHasEditor = always(
  now(() => {
    const s = editorUi.current;
    return !!s && s.selected.length === 1 && s.editorsInSelectedPanel === 0;
  }).implies(
    eventually(() => {
      const s = editorUi.current;
      return !s || s.selected.length !== 1 || s.editorsInSelectedPanel === 1;
    }).within(3, "seconds"),
  ),
);

/** Edits to the main file reach the store (`editor-wc.editorCode`). */
export const editorDocReachesStore = always(
  now(() => editorUi.current?.docMatchesStore === false).implies(
    eventually(() => editorUi.current?.docMatchesStore !== false).within(
      2,
      "seconds",
    ),
  ),
);

// Actions. The default generators can't type into CodeMirror: it is a
// contenteditable inside a shadow root.

const cmLines = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  const content = activeCmContent(root);
  if (!content) return [];
  const lines = Array.from(content.querySelectorAll(".cm-line")) as Element[];
  const targets = [];
  // The last few lines: appending is the most useful place to type.
  for (const line of lines.slice(-6)) {
    if (!isVisible(state.window, line)) continue;
    const point = clickablePoint(line);
    if (point && inViewport(state.window, point)) {
      targets.push({ fingerprint: getFingerprint(line), point });
    }
  }
  return targets;
});

const clickIntoEditor = actions(() =>
  cmLines.current.map(({ fingerprint, point }) => ({
    Click: { fingerprint, point },
  })),
);

const canType = () =>
  !!editorUi.current?.focused && editorUi.current?.editable === "true";

// Constrained snippets: no loops, input() or imports, which would hang runs
// or download packages.
const typeInEditor = weighted([
  [
    6,
    actions(() => {
      if (!canType()) return [];
      const language = editorUi.current!.language;
      const pattern =
        language === "python"
          ? '\\nprint\\("[a-z]{1,8}"\\)'
          : language === "css"
            ? "\\np \\{ color: (red|blue|green); \\}"
            : language === "javascript"
              ? "\\nconsole\\.log\\([0-9]{1,3}\\);"
              : "\\n<p>[a-z ]{1,12}</p>";
      return [{ TypeText: { text: { Regexp: pattern } } }];
    }),
  ],
  [
    2,
    actions(() =>
      canType() ? [{ PressKey: { code: 13 } }, { PressKey: { code: 8 } }] : [],
    ),
  ],
  [
    1,
    actions(() =>
      canType() ? [{ TypeText: { text: { Text: [1, 12] } } }] : [],
    ),
  ],
]);

/**
 * Replace the whole document of the active editor via its EditorView. This
 * goes through the same updateListener as typing, so redux sees the change.
 */
const replaceEditorDoc = registerCustomAction(
  "replaceEditorDoc",
  async (document, _window, text: string) => {
    const content = activeCmContent(editorHost(document)?.shadowRoot ?? null);
    // A programmatic dispatch ignores EditorView.editable, so respect
    // read-only mode here.
    if (!content || content.getAttribute("contenteditable") !== "true") return;
    const view = cmView(content);
    if (!view) return;
    view.focus();
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: text },
      selection: { anchor: text.length },
      userEvent: "input.paste",
      scrollIntoView: true,
    });
  },
);

const SNIPPETS: Record<string, string[]> = {
  html: ["<h1>bombadil</h1>\n<p>ok</p>\n", "<p>unclosed", ""],
  python: ['print("bombadil")\n', "print(\n", ""],
  css: ["h1 { color: red; }\n", "h1 { color: \n"],
  javascript: ["console.log(1);\n", "function (\n"],
};

const replaceDoc = actions(() => {
  const s = editorUi.current;
  if (!s || s.editorsInSelectedPanel !== 1 || s.editable !== "true") return [];
  return (SNIPPETS[s.language ?? "html"] ?? SNIPPETS.html).map((text) =>
    replaceEditorDoc(text),
  );
});

/**
 * Open every file in the Project files panel as a tab. Multi-tab states
 * (and closing a tab in the middle) are rare with random clicks alone.
 */
const openAllProjectFiles = registerCustomAction(
  "openAllProjectFiles",
  async (document, _window) => {
    const root = editorHost(document)?.shadowRoot as ShadowRoot | null;
    const filesTab = root?.querySelector(
      "#sidebar-tab-file",
    ) as HTMLElement | null;
    if (!root || !filesTab) return;
    if (filesTab.getAttribute("aria-selected") !== "true") {
      filesTab.click();
      await new Promise((r) => setTimeout(r, 100));
    }
    for (const button of Array.from(
      root.querySelectorAll(".sidebar__panel button.files-list-item"),
    ) as HTMLElement[]) {
      button.click();
      await new Promise((r) => setTimeout(r, 50));
    }
  },
);

const canOpenFiles = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  return (
    !!root?.querySelector("#sidebar-tab-file") &&
    !!root?.querySelector("section.editor-input")
  );
});

export const editorActions = weighted([
  [3, clickIntoEditor],
  [6, typeInEditor],
  [1, replaceDoc],
  [1, actions(() => (canOpenFiles.current ? [openAllProjectFiles()] : []))],
]);
