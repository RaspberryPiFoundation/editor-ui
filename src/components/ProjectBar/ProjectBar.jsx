import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import SaveStatus from "../SaveStatus/SaveStatus";
import ProjectName from "../ProjectName/ProjectName";
import DownloadButton from "../DownloadButton/DownloadButton";
import SaveButton from "../SaveButton/SaveButton";

import "../../assets/stylesheets/ProjectBar.scss";
import { isOwner } from "../../utils/projectHelpers";
import { postMessageToScratchIframe } from "../../utils/scratchIframe";

const ProjectBar = ({ nameEditable = true }) => {
  const { t } = useTranslation();

  const project = useSelector((state) => state.editor.project);
  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.editor.loading);
  const saving = useSelector((state) => state.editor.saving);
  const lastSavedTime = useSelector((state) => state.editor.lastSavedTime);
  const projectOwner = isOwner(user, project);
  const readOnly = useSelector((state) => state.editor.readOnly);

  const saveScratchProject = () => {
    postMessageToScratchIframe({ type: "scratch-gui-save" });
  };

  return (
    loading === "success" && (
      <div className="project-bar">
        {loading === "success" && (
          <ProjectName editable={!readOnly && nameEditable} isHeading={true} />
        )}
        <div className="project-bar__right">
          {loading === "success" && (
            <div className="project-bar__btn-wrapper">
              <DownloadButton
                text={t("header.download")}
                className="btn btn--tertiary project-bar__btn"
                type="tertiary"
              />
            </div>
          )}
          {loading === "success" && !projectOwner && !readOnly && (
            <div className="project-bar__btn-wrapper">
              <SaveButton className="project-bar__btn btn--save" />
            </div>
          )}
          {project.project_type === "code_editor_scratch" && (
            <button
              className="project-bar__btn btn--save"
              onClick={saveScratchProject}
            >
              Save
            </button>
          )}
          {lastSavedTime && user && !readOnly && (
            <SaveStatus saving={saving} lastSavedTime={lastSavedTime} />
          )}
        </div>
      </div>
    )
  );
};

export default ProjectBar;
