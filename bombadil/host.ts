// Host integration: things a host page does to <editor-wc>.

import {
  actions,
  extract,
  registerCustomAction,
} from "@antithesishq/bombadil/browser";
import {
  activeCmContent,
  cmView,
  editorHost,
  editorMatchesSelectedTab,
  recordFailure,
  sleep,
  waitFor,
} from "./lib/dom.ts";
import { oracleProperty } from "./lib/oracles.ts";

// Locales that have a translation file in public/translations.
const LOCALES = ["fr-FR", "ja-JP", "uk-UA", "nl-NL"];

/**
 * Edit the code, then change the `locale` attribute the way a host page
 * would. Unsaved edits should survive the re-render (see the comment in
 * src/hooks/useProject.js). Switches back to en afterwards so the
 * en-only text checks elsewhere keep working.
 */
const editThenSwitchLocale = registerCustomAction(
  "editThenSwitchLocale",
  async (document, window, locale: string) => {
    const host = editorHost(document);
    const content = activeCmContent(host?.shadowRoot ?? null);
    const view = cmView(content);
    if (
      !host ||
      !view ||
      content.getAttribute("contenteditable") !== "true" ||
      !editorMatchesSelectedTab(host.shadowRoot)
    ) {
      return;
    }
    const marker = `bombadil-locale-${Date.now().toString(36)}`;
    const comment =
      (content.getAttribute("data-language") ?? "") === "python"
        ? `\n# ${marker}\n`
        : `\n<!-- ${marker} -->\n`;
    view.dispatch({
      changes: { from: view.state.doc.length, insert: comment },
    });
    if (
      !(await waitFor(() => host.codeChangedSinceInitialLoad === true, 2_000))
    ) {
      return; // edit didn't register; nothing to judge
    }
    host.setAttribute("locale", locale);
    await sleep(2_500);
    const kept =
      host.codeChangedSinceInitialLoad === true &&
      String(host.editorCode ?? "").includes(marker);
    host.setAttribute("locale", "en");
    await sleep(1_000);
    // editorCode is the main file; only judge when we edited it.
    const label = content.getAttribute("aria-label") ?? "";
    if (!kept && /^(main\.py|index\.html) /.test(label)) {
      recordFailure(
        window,
        "localeSwitchKeepsUnsavedEdits",
        `switching locale to ${locale} discarded the unsaved edit ${marker}`,
      );
    }
  },
);

export const localeSwitchKeepsUnsavedEdits = oracleProperty(
  "localeSwitchKeepsUnsavedEdits",
);

// Mirrors the guards at the top of editThenSwitchLocale.
const canSwitchLocale = extract((state) => {
  const root = editorHost(state.document)?.shadowRoot ?? null;
  const content = activeCmContent(root);
  return (
    !!cmView(content) &&
    content.getAttribute("contenteditable") === "true" &&
    editorMatchesSelectedTab(root)
  );
});

export const hostActions = actions(() =>
  canSwitchLocale.current ? LOCALES.map((l) => editThenSwitchLocale(l)) : [],
);
