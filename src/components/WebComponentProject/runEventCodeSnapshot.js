import { buildProjectCodeSnapshot } from "./buildProjectCodeSnapshot";

let lastEmittedCodeSnapshot = null;
let trackedProjectIdentifier = null;
let emitRunEventsForCurrentCycle = false;

export const beginRunEventCycle = (
  projectIdentifier,
  components,
  { bypassSnapshot = false } = {},
) => {
  if (bypassSnapshot) {
    emitRunEventsForCurrentCycle = true;
    return true;
  }

  const snapshot = buildProjectCodeSnapshot(components);

  if (trackedProjectIdentifier !== projectIdentifier) {
    lastEmittedCodeSnapshot = null;
    trackedProjectIdentifier = projectIdentifier ?? null;
  }

  if (snapshot === lastEmittedCodeSnapshot) {
    emitRunEventsForCurrentCycle = false;
    return false;
  }

  lastEmittedCodeSnapshot = snapshot;
  emitRunEventsForCurrentCycle = true;
  return true;
};

export const shouldEmitRunCompletedEvent = () => emitRunEventsForCurrentCycle;

export const endRunEventCycle = () => {
  emitRunEventsForCurrentCycle = false;
};

export const resetRunEventCodeSnapshot = () => {
  lastEmittedCodeSnapshot = null;
  trackedProjectIdentifier = null;
  emitRunEventsForCurrentCycle = false;
};
