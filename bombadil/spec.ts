// Bombadil specification for the editor web component.
//
// Run it with `yarn test:bombadil` (see docs/Bombadil.md). Bombadil checks
// every exported property in every state it visits, and picks its next action
// from the exported action generator.

import { isAction } from "@antithesishq/bombadil/actions";
import { extract, weighted, type Point } from "@antithesishq/bombadil/browser";
import {
  clicks,
  navigation,
  scroll,
  waitOnce,
} from "@antithesishq/bombadil/browser/defaults/actions";
import { editorActions } from "./editor.ts";
import { hostActions } from "./host.ts";
import { runnerActions } from "./runners.ts";
import { dialogActions, instructionActions } from "./sidebar.ts";

// Properties

export {
  noHttpErrorCodes,
  noCrashToBlankEditor,
  editorShellEventuallyReady,
  noAppConsoleErrors,
  noAppUncaughtExceptions,
  noUntranslatedI18nKeysVisible,
} from "./shell.ts";

export {
  fileTabsWellFormed,
  activeEditorMatchesSelectedTab,
  selectedTabEventuallyHasEditor,
  editorDocReachesStore,
} from "./editor.ts";

export {
  runControlsCoherent,
  htmlRunNeverStuckRunning,
  htmlRunButtonEventuallyEnabled,
  htmlPreviewStaysInsideRenderer,
  htmlPreviewShowsLatestCode,
  htmlRunEmitsRunCompleted,
  inputPromptOnlyWhileRunning,
  stopEventuallyReturnsToRun,
  errorLineImpliesErrorShown,
  pythonRunsBehave,
} from "./runners.ts";

export {
  sidebarTabMatchesPanel,
  modalsWellFormed,
  openModalNotHiddenFromAT,
  escapeClosesModal,
  fileNamesValid,
  fileNameModalsBehave,
  stepCounterInRange,
  instructionsSanitised,
  instructionsViewShowsEdits,
} from "./sidebar.ts";

export { localeSwitchKeepsUnsavedEdits } from "./host.ts";

// Actions

// The host page's "Load Sample Projects" links reload the whole page. Left
// at the default weight they get most of the clicks, so they are split out
// and given a low weight to let exploration go deeper inside the editor.
const sampleProjectsBar = extract((state) => {
  const bar = state.document.querySelector("#sample-projects-bar");
  if (!bar) return null;
  const { left, top, right, bottom } = bar.getBoundingClientRect();
  return { left, top, right, bottom };
});

function inSampleProjectsBar(point: Point<unknown>): boolean {
  const rect = sampleProjectsBar.current;
  const { x, y } = point;
  return (
    rect !== null &&
    typeof x === "number" &&
    typeof y === "number" &&
    x >= rect.left &&
    x <= rect.right &&
    y >= rect.top &&
    y <= rect.bottom
  );
}

const editorClicks = clicks.filter(
  (action) =>
    !(isAction(action, "Click") && inSampleProjectsBar(action.Click.point)),
);
const switchSampleProject = clicks.filter(
  (action) =>
    isAction(action, "Click") && inSampleProjectsBar(action.Click.point),
);

// Custom actions drive the DOM directly, so they could reach "through" an
// open dialog's overlay where a real user can't. Only offer them when no
// dialog is open. (dialogActions are the ones meant for open dialogs.)
const dialogOpen = extract(
  (state) =>
    !!state.document
      .querySelector("editor-wc")
      ?.shadowRoot?.querySelector(".ReactModal__Overlay"),
);
const noDialog = () => !dialogOpen.current;

export const editorUiActions = weighted([
  [100, editorClicks],
  [40, editorActions.when(noDialog)],
  [30, runnerActions.when(noDialog)],
  [20, dialogActions],
  [10, instructionActions.when(noDialog)],
  [20, scroll],
  [5, switchSampleProject],
  [5, navigation],
  [2, hostActions.when(noDialog)],
  [1, waitOnce],
]);
