import { buildProjectCodeSnapshot } from "./buildProjectCodeSnapshot";

export const RUN_EVENT_DEBOUNCE_MS = 250;

let lastEmittedCodeSnapshot = null;
let trackedProjectIdentifier = null;
let emitRunEventsForCurrentCycle = false;
let debounceTimer = null;
let runEndedWhileDebouncing = false;
let pendingCallbacks = null;

const syncTrackedProject = (projectIdentifier) => {
  if (trackedProjectIdentifier !== projectIdentifier) {
    lastEmittedCodeSnapshot = null;
    trackedProjectIdentifier = projectIdentifier ?? null;
  }
};

const clearDebounceTimer = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
};

const shouldAllowRunEvent = (components, bypassSnapshot) => {
  if (bypassSnapshot) {
    return true;
  }

  const snapshot = buildProjectCodeSnapshot(components);

  if (snapshot === lastEmittedCodeSnapshot) {
    return false;
  }

  lastEmittedCodeSnapshot = snapshot;
  return true;
};

const flushDebouncedRunEvent = () => {
  debounceTimer = null;
  const callbacks = pendingCallbacks;
  pendingCallbacks = null;

  if (!callbacks) {
    return;
  }

  const {
    projectIdentifier,
    components,
    bypassSnapshot,
    onRunStarted,
    onRunCompletedIfRunAlreadyEnded,
  } = callbacks;

  syncTrackedProject(projectIdentifier);

  if (!shouldAllowRunEvent(components, bypassSnapshot)) {
    emitRunEventsForCurrentCycle = false;
    runEndedWhileDebouncing = false;
    return;
  }

  emitRunEventsForCurrentCycle = true;
  onRunStarted?.();

  if (runEndedWhileDebouncing) {
    onRunCompletedIfRunAlreadyEnded?.();
    emitRunEventsForCurrentCycle = false;
    runEndedWhileDebouncing = false;
  }
};

export const scheduleRunEventCycle = (
  projectIdentifier,
  components,
  { bypassSnapshot = false } = {},
  { onRunStarted, onRunCompletedIfRunAlreadyEnded } = {},
) => {
  syncTrackedProject(projectIdentifier);
  runEndedWhileDebouncing = false;
  pendingCallbacks = {
    projectIdentifier,
    components,
    bypassSnapshot,
    onRunStarted,
    onRunCompletedIfRunAlreadyEnded,
  };

  clearDebounceTimer();
  debounceTimer = setTimeout(flushDebouncedRunEvent, RUN_EVENT_DEBOUNCE_MS);
};

export const handleRunEndedForEventCycle = ({ onRunCompleted }) => {
  if (debounceTimer) {
    runEndedWhileDebouncing = true;
    return;
  }

  if (emitRunEventsForCurrentCycle) {
    onRunCompleted?.();
  }
};

export const shouldEmitRunCompletedEvent = () => emitRunEventsForCurrentCycle;

export const endRunEventCycle = () => {
  if (debounceTimer) {
    return;
  }

  emitRunEventsForCurrentCycle = false;
  runEndedWhileDebouncing = false;
};

export const resetRunEventCodeSnapshot = () => {
  clearDebounceTimer();
  pendingCallbacks = null;
  lastEmittedCodeSnapshot = null;
  trackedProjectIdentifier = null;
  emitRunEventsForCurrentCycle = false;
  runEndedWhileDebouncing = false;
};
