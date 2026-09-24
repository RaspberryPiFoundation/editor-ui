import { ViewPlugin } from "@codemirror/view";

const TAB_EXIT_DURATION = 2000;
const TAB_EXIT_PRESERVING_KEYS = new Set([
  "Tab",
  "Shift",
  "Control",
  "Alt",
  "Meta",
]);
const TAB_EXIT_CLASS = "cm-tab-exit-ready";

class TabExitIndicator {
  constructor(view) {
    this.view = view;
    this.timeout = undefined;
  }

  show() {
    this.hide();
    this.view.dom.classList.add(TAB_EXIT_CLASS);
    this.timeout = window.setTimeout(() => this.hide(), TAB_EXIT_DURATION);
  }

  hide() {
    window.clearTimeout(this.timeout);
    this.timeout = undefined;
    this.view.dom.classList.remove(TAB_EXIT_CLASS);
  }

  destroy() {
    this.hide();
  }
}

export const tabExitIndicator = ViewPlugin.fromClass(TabExitIndicator, {
  eventObservers: {
    keydown(event) {
      if (event.key === "Escape") {
        this.show();
      } else if (!TAB_EXIT_PRESERVING_KEYS.has(event.key)) {
        this.hide();
      }
    },
    blur() {
      this.hide();
    },
  },
});
