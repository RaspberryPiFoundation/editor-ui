import { isOwner, projectHasChangedSinceInitialLoad } from "./projectHelpers";

export const isEligibleForOwnerAutoSave = (user, project) =>
  isOwner(user, project) && Boolean(project?.identifier);

export const isOwnerAutoSaveBlocked = ({
  codeRunInProgress,
  inFlight,
  saving,
}) => codeRunInProgress || inFlight || saving === "pending";

export const hasOwnerProjectChanged = (
  project,
  initialComponents,
  { initialName, initialInstructions } = {},
) =>
  projectHasChangedSinceInitialLoad(project, initialComponents, {
    initialName,
    initialInstructions,
  });
