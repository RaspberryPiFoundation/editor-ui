import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, TextInput } from "@raspberrypifoundation/design-system-react";
import PropTypes from "prop-types";

import PencilIcon from "../../../../assets/icons/pencil.svg";
import TickIcon from "../../../../assets/icons/tick.svg";
import { useProjectNameEditing } from "../../../../hooks/useProjectNameEditing";

const ProjectNameInput = ({ editable }) => {
  const { t } = useTranslation();
  const {
    actionRef,
    handleBlur,
    handleKeyDown,
    isEditing,
    name,
    saveName,
    setName,
    startEditing,
  } = useProjectNameEditing();
  const field = useRef();

  useEffect(() => {
    if (isEditing) {
      const input = field.current.querySelector("input");
      input.focus();
      input.select();
    }
  }, [isEditing]);

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
        <div className="projects-panel__project-name-action" ref={actionRef}>
          <Button
            aria-label={t(
              isEditing ? "header.renameSave" : "header.renameProject",
            )}
            title={t(isEditing ? "header.renameSave" : "header.renameProject")}
            icon={isEditing ? <TickIcon /> : <PencilIcon />}
            iconOnly
            onClick={isEditing ? saveName : startEditing}
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
