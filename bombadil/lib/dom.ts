// Helpers shared by the specification modules.
//
// Bombadil runs the whole bundled specification inside the page under test,
// so these functions can be called from `extract` and custom action
// callbacks.

/** The `<editor-wc>` element on the host test page. */
export function editorHost(doc: Document): any {
  return doc.querySelector("editor-wc");
}

/**
 * The editor's open shadow root. The React app, modals, toasts and context
 * menus all live in this one shadow root.
 */
export function editorRoot(doc: Document): ShadowRoot | null {
  return editorHost(doc)?.shadowRoot ?? null;
}

/**
 * Get the CodeMirror 6 `EditorView` from its `.cm-content` element.
 * @codemirror/view >= 6.38 stores a tile on `dom.cmTile`. Older versions
 * used `dom.cmView`.
 */
export function cmView(content: any): any {
  return (
    content?.cmTile?.root?.view ??
    content?.cmTile?.view ??
    content?.cmView?.rootView?.view ??
    content?.cmView?.view ??
    null
  );
}

/** The `.cm-content` of the CodeMirror in the selected file tab, if any. */
export function activeCmContent(root: ShadowRoot | null): any {
  return (
    root?.querySelector(
      "section.editor-input .react-tabs__tab-panel--selected .cm-content",
    ) ?? null
  );
}

/** File name of the selected editor tab, e.g. "index.html". */
export function selectedTabName(root: ShadowRoot | null): string | null {
  const tab = root?.querySelector(
    'section.editor-input [role="tab"][aria-selected="true"]',
  );
  return (
    tab?.querySelector(".react-tabs__tab-text")?.textContent?.trim() ?? null
  );
}

/**
 * True when the active CodeMirror belongs to the selected tab. After some
 * known bugs (see activeEditorMatchesSelectedTab) it shows another file;
 * custom actions skip that state so the bug isn't blamed on other checks.
 */
export function editorMatchesSelectedTab(root: ShadowRoot | null): boolean {
  const label = activeCmContent(root)?.getAttribute("aria-label") ?? "";
  const labelFile = label.match(/[^\s"'“”«»()]+\.[A-Za-z0-9]+/)?.[0];
  return !!labelFile && labelFile === selectedTabName(root);
}

/** True when the output frame is pointed at the HTML renderer. */
export function outputShowsRenderer(root: ShadowRoot, win: Window): boolean {
  const outer = root.querySelector("#output-frame");
  if (!outer) return true; // not mounted until the first run
  try {
    const url = new URL(outer.getAttribute("src") ?? "", win.location.href);
    return (
      url.origin === win.location.origin &&
      url.pathname.endsWith("/html-renderer.html")
    );
  } catch {
    return false;
  }
}

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Poll `check` until it returns true or `timeoutMs` elapses. */
export async function waitFor(
  check: () => boolean,
  timeoutMs: number,
  intervalMs = 50,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (check()) return true;
    await sleep(intervalMs);
  }
  return check();
}

/**
 * Set the value of a React-controlled input or textarea. A plain `.value =`
 * assignment is ignored by React, so use the native setter and fire `input`.
 */
export function setNativeValue(
  win: Window,
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string,
) {
  const proto =
    el instanceof (win as any).HTMLTextAreaElement
      ? (win as any).HTMLTextAreaElement.prototype
      : (win as any).HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(el, value);
  el.dispatchEvent(new (win as any).Event("input", { bubbles: true }));
}

/**
 * Record a failed check from a custom action. Properties in `oracles.ts`
 * report anything recorded here. A Reload or navigation gives a fresh
 * `window`, which clears the list.
 */
export function recordFailure(win: Window, property: string, detail: string) {
  const w = win as any;
  w.__bombadilFailures ??= {} as Record<string, string[]>;
  (w.__bombadilFailures[property] ??= []).push(detail);
}

/** The first idle, enabled and rendered Run button. */
export function enabledRunButton(root: ShadowRoot): HTMLButtonElement | null {
  return (
    (
      Array.from(
        root.querySelectorAll(".runner-controls button.btn--run"),
      ) as HTMLButtonElement[]
    ).find((b) => !b.disabled && b.getClientRects().length > 0) ?? null
  );
}

/** "idle" | "running" | "stopping" for every Run/Stop control. */
export function runPhases(root: ShadowRoot): string[] {
  return (
    Array.from(
      root.querySelectorAll(".runner-controls button"),
    ) as HTMLButtonElement[]
  ).map((b) =>
    b.classList.contains("btn--stop")
      ? b.getAttribute("aria-disabled") === "true"
        ? "stopping"
        : "running"
      : "idle",
  );
}

/** Click a Run/Stop button. On mobile the handler is on `.btn-outer`. */
export function clickButton(btn: HTMLElement) {
  ((btn.closest(".btn-outer") as HTMLElement | null) ?? btn).click();
}

// Copies of helpers from Bombadil's default actions, which the package
// doesn't export.

export function isVisible(win: Window, element: Element): boolean {
  const style = win.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    parseFloat(style.opacity || "1") > 0
  );
}

export function clickablePoint(
  element: Element,
): { x: number; y: number } | null {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0
    ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    : null;
}

export function inViewport(
  win: Window,
  point: { x: number; y: number },
): boolean {
  return (
    point.x >= 0 &&
    point.x <= win.innerWidth &&
    point.y >= 0 &&
    point.y <= win.innerHeight
  );
}
