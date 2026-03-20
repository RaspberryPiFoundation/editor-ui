import { useSelector } from "react-redux";
import { isOwner } from "../utils/projectHelpers";
import { shouldRemixScratchProjectOnSave } from "../utils/scratchIframe";
import { useScratchSaveState } from "./useScratchSaveState";

export const useScratchSave = ({ enabled = true } = {}) => {
  const loading = useSelector((state) => state.editor.loading);
  const user = useSelector((state) => state.auth.user);
  const project = useSelector((state) => state.editor.project);
  const scratchIframeProjectIdentifier = useSelector(
    (state) => state.editor.scratchIframeProjectIdentifier,
  );

  const projectOwner = isOwner(user, project);
  const isScratchProject = project?.project_type === "code_editor_scratch";
  const enableScratchSaveState = Boolean(
    enabled && loading === "success" && user && isScratchProject,
  );
  const shouldRemixOnSave = shouldRemixScratchProjectOnSave({
    user,
    identifier: project?.identifier,
    projectOwner,
    scratchIframeProjectIdentifier,
  });
  const { isScratchSaving, saveScratchProject, scratchSaveLabelKey } =
    useScratchSaveState({
      enabled: enableScratchSaveState,
    });

  return {
    enableScratchSaveState,
    isScratchSaving,
    loading,
    projectOwner,
    saveScratchProject,
    scratchSaveLabelKey,
    shouldRemixOnSave,
    user,
  };
};
