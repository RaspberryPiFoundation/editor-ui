import { resetRunEventCodeSnapshot } from "./runEventCodeSnapshot";

let prevCodeRunTriggered = false;
let trackedProjectIdentifier = null;

export const getPrevCodeRunTriggered = () => prevCodeRunTriggered;

export const setPrevCodeRunTriggered = (value) => {
  prevCodeRunTriggered = value;
};

export const resetCodeRunEventTracking = () => {
  prevCodeRunTriggered = false;
  trackedProjectIdentifier = null;
  resetRunEventCodeSnapshot();
};

export const syncRunEventTrackingProject = (
  projectIdentifier,
  codeRunTriggered,
) => {
  if (
    trackedProjectIdentifier !== null &&
    trackedProjectIdentifier !== projectIdentifier
  ) {
    prevCodeRunTriggered = codeRunTriggered;
  }

  trackedProjectIdentifier = projectIdentifier ?? null;
};
