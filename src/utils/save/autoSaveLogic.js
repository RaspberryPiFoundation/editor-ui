import { isOwner, projectHasChangedSinceInitialLoad } from "../projectHelpers";

/** Logged-in project author with a saved project identifier. */
export const isEligibleForAutoSave = (user, project) =>
  isOwner(user, project) && Boolean(project?.identifier);

export const isAutoSaveBlocked = ({ codeRunInProgress, inFlight, saving }) =>
  codeRunInProgress || inFlight || saving === "pending";

export const hasProjectChangedForAutoSave = (
  project,
  initialComponents,
  { initialName, initialInstructions } = {},
) =>
  projectHasChangedSinceInitialLoad(project, initialComponents, {
    initialName,
    initialInstructions,
  });
