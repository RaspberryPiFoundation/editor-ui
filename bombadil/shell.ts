// App shell: mounting, crashes, console/exception hygiene and i18n.

import { always, eventually, now } from "@antithesishq/bombadil";
import { extract } from "@antithesishq/bombadil/browser";
import { editorHost } from "./lib/dom.ts";

export {
  noHttpErrorCodes,
  // (the other default properties are replaced by filtered versions below)
} from "@antithesishq/bombadil/browser/defaults/properties";

const shell = extract((state) => {
  const host = editorHost(state.document);
  const root = host?.shadowRoot?.querySelector("#root");
  if (!host || !host.isConnected || !root) {
    return { present: false, blank: false, ready: false };
  }
  const children = Array.from(root.children as HTMLCollection).filter(
    (el) => el.tagName !== "STYLE",
  );
  return {
    present: true,
    blank: children.length === 0,
    ready: !!root.querySelector("#wc"),
  };
});

/**
 * There is no React error boundary, so an uncaught render error unmounts the
 * whole app and leaves the shadow `#root` empty. It is briefly empty while
 * the first render waits for translations, hence the grace period.
 */
export const noCrashToBlankEditor = always(
  now(() => shell.current.present && shell.current.blank).implies(
    eventually(() => !shell.current.present || !shell.current.blank).within(
      5,
      "seconds",
    ),
  ),
);

/**
 * The test page loads projects from local fixtures, so the editor must leave
 * the loading/"Load failed" screens quickly.
 */
export const editorShellEventuallyReady = always(
  now(() => shell.current.present && !shell.current.ready).implies(
    eventually(() => !shell.current.present || shell.current.ready).within(
      10,
      "seconds",
    ),
  ),
);

// Console errors and uncaught exceptions. These replace Bombadil's default
// noConsoleErrors / noUncaughtExceptions / noUnhandledPromiseRejections,
// filtering noise that isn't the editor's fault.
const IGNORED_CONSOLE_ERRORS = [
  // Vite dev client losing its HMR websocket
  /^\[vite\]/,
  // Benign browser warning, also ignored in Sentry (src/web-component.jsx)
  /ResizeObserver loop/,
];
const IGNORED_EXCEPTIONS = [/ResizeObserver loop/];

const appConsoleErrors = extract((state) =>
  state.console
    .filter((entry) => entry.level === "error")
    .map((entry) =>
      entry.args
        .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
        .join(" "),
    )
    .filter((msg) => !IGNORED_CONSOLE_ERRORS.some((re) => re.test(msg))),
);

const appExceptions = extract((state) => {
  const origin = state.window.location.origin;
  return state.errors.uncaughtExceptions
    .filter((e) => {
      // User code in the HTML preview runs from about:srcdoc/blob: URLs, and
      // the Pyodide worker is a blob: URL. Only count the editor's own code.
      const url = e.url ?? e.stacktrace?.[0]?.url ?? null;
      if (url && !url.startsWith(origin + "/")) return false;
      const text = `${e.text} ${e.remote_object?.description ?? ""}`;
      return !IGNORED_EXCEPTIONS.some((re) => re.test(text));
    })
    .map((e) => {
      const description = e.remote_object?.description?.split("\n")[0];
      return `${e.text} ${description ?? ""} @ ${e.url}:${e.line}`;
    });
});

export const noAppConsoleErrors = always(
  () => appConsoleErrors.current.length === 0,
);

export const noAppUncaughtExceptions = always(
  () => appExceptions.current.length === 0,
);

// i18n: a key missing from en.json is rendered as the raw key.
const I18N_NAMESPACES = [
  "button",
  "common",
  "downloadPanel",
  "editorPanel",
  "filePanel",
  "footer",
  "header",
  "imagePanel",
  "infoPanel",
  "input",
  "instructionsPanel",
  "mobile",
  "modal",
  "modals",
  "newInputPanelButton",
  "notifications",
  "output",
  "outputViewToggle",
  "project",
  "projectHeader",
  "projectList",
  "projectName",
  "projectTypes",
  "projectsPanel",
  "regions",
  "runButton",
  "runners",
  "saveStatus",
  "settingsPanel",
  "sidebar",
  "webComponent",
];
// User-authored content and program output are not translated.
const USER_CONTENT =
  ".cm-editor, .project-instructions, .project-instructions__content, " +
  ".pythonrunner-console, .error-message, .project-name, .files-list-item, " +
  ".react-tabs__tab-text, textarea";

const untranslatedKeys = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot as ShadowRoot | null;
  if (!root || !root.querySelector("#wc")) return [];
  const keyPattern = new RegExp(
    `^(${I18N_NAMESPACES.join("|")})\\.[A-Za-z0-9_.]+$`,
  );
  const hits: string[] = [];
  const walker = state.document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
  );
  for (let n = walker.nextNode(); n && hits.length < 5; n = walker.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) {
      const text = (n.textContent ?? "").trim();
      if (keyPattern.test(text) && !n.parentElement?.closest(USER_CONTENT)) {
        hits.push(text);
      }
    } else {
      const el = n as Element;
      if (el.closest(USER_CONTENT)) continue;
      for (const attr of ["aria-label", "title", "placeholder", "alt"]) {
        const value = el.getAttribute(attr)?.trim();
        if (value && keyPattern.test(value)) hits.push(`${attr}=${value}`);
      }
    }
  }
  return hits;
});

export const noUntranslatedI18nKeysVisible = always(
  () => untranslatedKeys.current.length === 0,
);
