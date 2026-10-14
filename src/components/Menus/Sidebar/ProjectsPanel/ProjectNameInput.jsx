import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Button, TextInput } from "@raspberrypifoundation/design-system-react";
import PropTypes from "prop-types";

import PencilIcon from "../../../../assets/icons/pencil.svg";
import TickIcon from "../../../../assets/icons/tick.svg";
import { updateProjectName } from "../../../../redux/EditorSlice";

const ProjectNameInput = ({ editable }) => {
  const projectName = useSelector((state) => state.editor.project.name);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const fallbackName = t("projectName.newProject");
  const field = useRef();
  const action = useRef();
  const [isEditing, setEditing] = useState(false);
  const [name, setName] = useState(projectName || fallbackName);

  useEffect(() => {
    setName(projectName || fallbackName);
  }, [fallbackName, projectName]);

  useEffect(() => {
    if (isEditing) {
      const input = field.current.querySelector("input");
      input.focus();
      input.select();
    }
  }, [isEditing]);

  const saveName = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setEditing(false);
    dispatch(updateProjectName(name));
  };

  const cancelEditing = () => {
    setEditing(false);
    setName(projectName || fallbackName);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      saveName(event);
    } else if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  const handleBlur = (event) => {
    if (!action.current?.contains(event.relatedTarget)) {
      cancelEditing();
    }
  };

  return (
    <div className="projects-panel__project-name projects-panel__item">
      <div ref={field}>
        <TextInput
          id="projects_panel_project_name"
          name="project_name"
          label={t("projectName.label")}
          value={name}
          readOnly={!isEditing}
          tabIndex={isEditing ? 0 : -1}
          fullWidth
          onBlur={handleBlur}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {editable && (
        <div className="projects-panel__project-name-action" ref={action}>
          <Button
            aria-label={t(
              isEditing ? "header.renameSave" : "header.renameProject",
            )}
            title={t(isEditing ? "header.renameSave" : "header.renameProject")}
            icon={isEditing ? <TickIcon /> : <PencilIcon />}
            iconOnly
            onClick={isEditing ? saveName : () => setEditing(true)}
            type={isEditing ? "primary" : "tertiary"}
            size="small"
          />
        </div>
      )}
    </div>
  );
};

ProjectNameInput.propTypes = {
  editable: PropTypes.bool.isRequired,
};

export default ProjectNameInput;
