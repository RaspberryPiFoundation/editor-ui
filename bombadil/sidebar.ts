// Sidebar panels, modals, file names and instructions.

import { always, eventually, now } from "@antithesishq/bombadil";
import {
  actions,
  extract,
  registerCustomAction,
  weighted,
} from "@antithesishq/bombadil/browser";
import {
  clickButton,
  editorHost,
  recordFailure,
  setNativeValue,
  sleep,
  waitFor,
} from "./lib/dom.ts";
import { oracleProperty } from "./lib/oracles.ts";

// Sidebar tabs. The instructions panel also uses role=tab/tabpanel, so scope
// by id prefix.
const sidebar = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  const bar = root?.querySelector('.sidebar__bar[role="tablist"]');
  if (!root || !bar) return null;
  return {
    selected: Array.from(
      bar.querySelectorAll('[role="tab"][id^="sidebar-tab-"]'),
    )
      .filter((t) => t.getAttribute("aria-selected") === "true")
      .map((t) => t.id.slice("sidebar-tab-".length)),
    panels: Array.from(
      root.querySelectorAll('[role="tabpanel"][id^="sidebar-panel-"]'),
    ).map((p) => ({
      name: p.id.slice("sidebar-panel-".length),
      labelledBy: p.getAttribute("aria-labelledby"),
      heading:
        p.querySelector(".sidebar__panel-heading")?.textContent?.trim() ?? "",
    })),
  };
});

/**
 * At most one sidebar tab is selected. A selected tab has exactly one
 * matching, labelled panel with a heading; no selection means no panel.
 */
export const sidebarTabMatchesPanel = always(() => {
  const s = sidebar.current;
  if (!s) return true;
  if (s.selected.length > 1) return false;
  if (s.selected.length === 0) return s.panels.length === 0;
  const name = s.selected[0];
  return (
    s.panels.length === 1 &&
    s.panels[0].name === name &&
    s.panels[0].labelledBy === `sidebar-tab-${name}` &&
    s.panels[0].heading.length > 0
  );
});

// Modals (react-modal, portalled into the shadow root's #wc).
const modals = extract((state) => {
  const host = editorHost(state.document);
  const root = host?.shadowRoot as ShadowRoot | null;
  const dialogs = root
    ? Array.from(root.querySelectorAll('.ReactModal__Content[role="dialog"]'))
    : [];
  return {
    hostAriaHidden: host?.getAttribute("aria-hidden") === "true",
    dialogs: dialogs.map((d) => ({
      heading:
        d.querySelector(".modal-content__heading")?.textContent?.trim() ?? "",
      label: d.getAttribute("aria-label") ?? "",
      enabledButtons: (
        Array.from(d.querySelectorAll("button")) as HTMLButtonElement[]
      ).filter((b) => !b.disabled && b.getClientRects().length > 0).length,
      focusInside: !!root?.activeElement && d.contains(root.activeElement),
    })),
  };
});

/**
 * At most one dialog is open, and every open dialog has a heading, an
 * accessible label and an enabled button to get out.
 */
export const modalsWellFormed = always(() => {
  const m = modals.current;
  return (
    m.dialogs.length <= 1 &&
    m.dialogs.every(
      (d) =>
        d.heading.length > 0 && d.label.length > 0 && d.enabledButtons >= 1,
    )
  );
});

/**
 * react-modal sets aria-hidden on its appElement. That is `<editor-wc>`,
 * which also contains the dialog, so the open dialog is hidden from
 * assistive technology.
 */
export const openModalNotHiddenFromAT = always(
  () => modals.current.dialogs.length === 0 || !modals.current.hostAriaHidden,
);

// There is deliberately no "aria-hidden is removed after closing" property.
// On the dev server it never is, but that's React StrictMode's double mount
// confusing react-modal's counter; without StrictMode it is removed.

const lastWasEscape = extract((state) => {
  const action: any = state.lastAction;
  return !!action && action.PressKey?.code === 27;
});

/** Escape with focus inside a dialog closes it. */
export const escapeClosesModal = always(
  now(() => lastWasEscape.current && modals.current.dialogs.length > 0).implies(
    eventually(() => modals.current.dialogs.length === 0).within(2, "seconds"),
  ),
);

const modalKeys = actions(() => {
  const dialog = modals.current.dialogs[0];
  if (!dialog || !dialog.focusInside) return [];
  return [
    { PressKey: { code: 27 } },
    { PressKey: { code: 9 } },
    { PressKey: { code: 13 } },
  ];
});

// File names (Project files panel, New file / Rename file modals).
const fileList = (root: ShadowRoot) =>
  Array.from(
    root.querySelectorAll(".sidebar__panel button.files-list-item > .text"),
  ).map((e) => e.textContent ?? "");

const projectType = (names: string[]) =>
  names.includes("main.py")
    ? "python"
    : names.includes("index.html")
      ? "html"
      : null;

const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  python: ["py", "csv", "txt"],
  html: ["html", "css", "js"],
};

/** Mirrors src/utils/componentNameValidation.js. */
function isValidFileName(name: string, type: string, existing: string[]) {
  const [base, ...rest] = name.split(".");
  return (
    base.length > 0 &&
    !name.includes(" ") &&
    name !== "INSTRUCTIONS.md" &&
    ALLOWED_EXTENSIONS[type].includes(rest.join(".")) &&
    !existing.includes(name)
  );
}

const files = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  const names = root ? fileList(root) : [];
  const dialog = root?.querySelector('.ReactModal__Content[role="dialog"]');
  return {
    names,
    type: projectType(names),
    fileModalOpen: !!dialog?.querySelector(
      '.modal-content__inputs input[type="text"]',
    ),
  };
});

/** File names in the Project files panel are unique and valid. */
export const fileNamesValid = always(() => {
  const { names, type } = files.current;
  if (names.length === 0 || !type) return true;
  if (new Set(names).size !== names.length) return false;
  return names.every((name) => isValidFileName(name, type, []));
});

/**
 * Type a name into the New file / Rename file modal, submit it, and check
 * the outcome. A valid name closes the modal and adds or renames the file.
 * An invalid one keeps the modal open with an error and no change.
 */
const submitFileName = registerCustomAction(
  "submitFileName",
  async (document, window, name: string) => {
    const root = editorHost(document)?.shadowRoot as ShadowRoot | null;
    const dialog = root?.querySelector('.ReactModal__Content[role="dialog"]');
    const input = dialog?.querySelector(
      '.modal-content__inputs input[type="text"]',
    ) as HTMLInputElement | null;
    if (!root || !dialog || !input) return;
    const kind = (
      dialog.querySelector(".modal-content__heading")?.textContent ?? ""
    ).startsWith("Rename")
      ? "rename"
      : "new";
    const before = fileList(root);
    const type = projectType(before);
    // The rename modal pre-fills the current name. Remember it per input
    // element (one per open modal): after a rejected attempt the input
    // still holds that attempt, not the original name.
    const w = window as any;
    w.__bombadilModalInitial ??= new WeakMap<HTMLInputElement, string>();
    if (!w.__bombadilModalInitial.has(input)) {
      w.__bombadilModalInitial.set(input, input.value);
    }
    const initial: string = w.__bombadilModalInitial.get(input);
    setNativeValue(window, input, name);
    await sleep(50);
    (
      dialog.querySelector(
        ".modal-content__buttons .rpf-button--primary",
      ) as HTMLButtonElement | null
    )?.click();
    // Without the file list open we can't judge the outcome.
    if (!type || before.length === 0) return;
    // React applies the click's update after this task. Until then the DOM
    // still shows the previous attempt (modal open, its error message, the
    // same files), which would look like a correct rejection.
    await sleep(100);

    const valid =
      (kind === "rename" && name === initial) ||
      isValidFileName(name, type, before);
    const outcomeOk = () => {
      const open = !!root.querySelector('.ReactModal__Content[role="dialog"]');
      const after = fileList(root);
      if (valid) {
        return (
          !open &&
          after.includes(name) &&
          (kind === "new"
            ? after.length === before.length + 1
            : after.length === before.length &&
              (name === initial || !after.includes(initial)))
        );
      }
      const error = root
        .querySelector(".ReactModal__Content .error-message__content")
        ?.textContent?.trim();
      return open && !!error && after.join("|") === before.join("|");
    };
    if (!(await waitFor(outcomeOk, 2_000))) {
      const expected = valid ? "accepted" : "rejected";
      const listed = fileList(root).join(", ");
      recordFailure(
        window,
        "fileNameModalsBehave",
        `${kind} "${name}" (from "${initial}") should be ${expected}; ` +
          `files: ${listed}`,
      );
    }
  },
);

export const fileNameModalsBehave = oracleProperty("fileNameModalsBehave");

const fileNameActions = actions(() => {
  const f = files.current;
  if (!f.fileModalOpen) return [];
  const ext = ALLOWED_EXTENSIONS[f.type ?? "html"];
  const wrongExt = f.type === "python" ? "html" : "py";
  return [
    ...ext.map((e, i) => `bmb_${i}.${e}`), // valid once, then duplicates
    ...f.names, // duplicates, or an unchanged rename
    "INSTRUCTIONS.md",
    `has space.${ext[0]}`,
    `.${ext[0]}`,
    "noextension",
    `a.b.${ext[0]}`,
    `UPPER.${ext[0].toUpperCase()}`,
    `wrong.${wrongExt}`,
    "",
  ].map((name) => submitFileName(name));
});

// Instructions.
const steps = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  const bar = root?.querySelector(".sidebar__panel .progress-bar");
  if (!bar) return null;
  // Text match assumes the en locale; skip otherwise.
  const match = /^(\d+) of (\d+)$/.exec(
    bar.querySelector(".step-counter")?.textContent?.trim() ?? "",
  );
  if (!match) return null;
  const progress = bar.querySelector("progress") as HTMLProgressElement | null;
  const prev = bar.querySelector(
    'button[title="Previous step"]',
  ) as HTMLButtonElement | null;
  const next = bar.querySelector(
    'button[title="Next step"]',
  ) as HTMLButtonElement | null;
  return {
    current: +match[1],
    total: +match[2],
    progressMax: progress?.max ?? null,
    progressValue: progress?.value ?? null,
    prevDisabled: !!prev?.disabled,
    nextDisabled: !!next?.disabled,
  };
});

/**
 * The "N of M" step counter stays in range and agrees with the progress
 * bar and the Previous/Next buttons.
 */
export const stepCounterInRange = always(() => {
  const s = steps.current;
  if (!s) return true;
  if (s.total < 1 || s.current < 1 || s.current > s.total) return false;
  if (
    s.total > 1 &&
    (s.progressMax !== s.total - 1 || s.progressValue !== s.current - 1)
  ) {
    return false;
  }
  return (
    s.prevDisabled === (s.current === 1) &&
    s.nextDisabled === (s.current === s.total)
  );
});

const FRAME_ORIGINS = [
  "https://editor.raspberrypi.org",
  "https://staging-editor.raspberrypi.org",
];

const instructions = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  const containers = root
    ? Array.from(
        root.querySelectorAll(
          ".react-tabs__tab-panel .project-instructions, " +
            ".project-instructions__content",
        ),
      )
    : [];
  const bad: string[] = [];
  for (const container of containers) {
    for (const el of Array.from(container.querySelectorAll("*"))) {
      const tag = el.tagName.toLowerCase();
      if (["script", "object", "embed", "base", "meta", "link"].includes(tag)) {
        bad.push(tag);
      }
      if (tag === "iframe") {
        let origin = "";
        try {
          origin = new URL(el.getAttribute("src") ?? "").origin;
        } catch {
          // invalid URL: treated as a disallowed origin
        }
        if (!FRAME_ORIGINS.includes(origin)) bad.push(`iframe:${origin}`);
      }
      if (tag === "style" && !el.closest("svg")) bad.push("style");
      for (const attr of Array.from(el.attributes)) {
        if (/^on/i.test(attr.name)) bad.push(`${tag}[${attr.name}]`);
        if (
          /^(href|src|xlink:href|action|formaction)$/i.test(attr.name) &&
          /^\s*(javascript|vbscript|data:text\/html)/i.test(attr.value)
        ) {
          bad.push(`${tag}[${attr.name}=${attr.value.slice(0, 40)}]`);
        }
      }
    }
  }
  return { bad, pwned: !!(state.window as any).__bombadilPwned };
});

/** Rendered instructions never contain executable markup. */
export const instructionsSanitised = always(
  () => instructions.current.bad.length === 0 && !instructions.current.pwned,
);

// The instructions panel's Edit and View tabs, found by position because
// their labels are translated.
function instructionTab(
  root: ShadowRoot,
  tab: "edit" | "view",
): HTMLElement | undefined {
  return root.querySelectorAll('.c-instruction-tabs [role="tab"]')[
    tab === "edit" ? 0 : 1
  ] as HTMLElement | undefined;
}

/** Text of the step shown on the View tab, or "" when View isn't showing. */
function viewedStepText(root: ShadowRoot): string {
  return (
    root.querySelector(
      ".c-instruction-tabs .react-tabs__tab-panel--selected " +
        ".project-instructions",
    )?.textContent ?? ""
  );
}

/**
 * Type markdown into the instructions editor, then show the View tab.
 *
 * Non-empty markdown starts with a plain-text marker. If View doesn't show
 * the marker, the payload never rendered and instructionsSanitised had
 * nothing to check. That happens when the step has pre-rendered `content`
 * (like every step in cool-html.json), because View shows `content` instead
 * of `markdown_content`. In that case, add a step, which only has
 * `markdown_content`, and type the markdown there.
 */
const typeInstructions = registerCustomAction(
  "typeInstructions",
  async (document, window, markdown: string) => {
    const root = editorHost(document)?.shadowRoot as ShadowRoot | null;
    if (!root?.querySelector('textarea[data-testid="instructionTextarea"]')) {
      return;
    }
    // A user can't reach the textarea through an open dialog's overlay.
    if (root.querySelector(".ReactModal__Overlay")) return;
    const marker = markdown
      ? `bombadil-instructions-${Date.now().toString(36)}`
      : "";
    const text = marker ? `${marker}\n\n${markdown}` : markdown;

    // "shown": View shows the marker. "hidden": the step kept the text but
    // View doesn't show it. "skipped": the text didn't stick, for example
    // because the current step position is past the last step after a
    // project reset (stepCounterInRange covers that), so there's nothing
    // to judge.
    const typeAndView = async (): Promise<"shown" | "hidden" | "skipped"> => {
      const textarea = root.querySelector(
        'textarea[data-testid="instructionTextarea"]',
      ) as HTMLTextAreaElement | null;
      if (!textarea) return "skipped";
      textarea.focus();
      setNativeValue(window, textarea, text);
      await sleep(50);
      if (textarea.value !== text) return "skipped";
      instructionTab(root, "view")?.click();
      if (!marker) return "shown";
      const shown = await waitFor(
        () => viewedStepText(root).includes(marker),
        1_000,
      );
      return shown ? "shown" : "hidden";
    };

    if ((await typeAndView()) !== "hidden") return;

    instructionTab(root, "edit")?.click();
    await sleep(50);
    // The first step action is "Add a step"; the second removes a step.
    const addStep = root.querySelector(
      ".instructions-panel__step-actions button",
    ) as HTMLElement | null;
    if (!addStep) return;
    clickButton(addStep);
    await sleep(100);
    if ((await typeAndView()) === "hidden") {
      recordFailure(
        window,
        "instructionsViewShowsEdits",
        `View didn't show ${marker} after typing it into a new step`,
      );
    }
  },
);

/**
 * Markdown typed into a step that only has `markdown_content` shows up on
 * the View tab. Checked by typeInstructions.
 */
export const instructionsViewShowsEdits = oracleProperty(
  "instructionsViewShowsEdits",
);

// Payloads avoid network requests (data: and .invalid hosts only).
const INSTRUCTION_SNIPPETS = [
  "## Step title\n\nSome **bold** text",
  "<script>window.__bombadilPwned=1</script>",
  '<img src="data:," onerror="window.__bombadilPwned=1">',
  '<svg onload="window.__bombadilPwned=1"><circle r="5"/></svg>',
  "[click](javascript:window.__bombadilPwned=1)",
  '<iframe src="https://example.invalid/"></iframe>',
  '<a href="data:text/html,<script>1</script>">x</a>',
  "```python\nprint('hi')\n```",
  "```html\n<p onclick=x>hi</p>\n```",
  "",
];

const hasInstructionsTextarea = extract(
  (state) =>
    !!editorHost(state.document)?.shadowRoot?.querySelector(
      'textarea[data-testid="instructionTextarea"]',
    ),
);

export const instructionActions = actions(() =>
  hasInstructionsTextarea.current
    ? INSTRUCTION_SNIPPETS.map((md) => typeInstructions(md))
    : [],
);

/** Actions for an open file name dialog. */
export const dialogActions = weighted([
  [6, fileNameActions],
  [2, modalKeys],
]);
