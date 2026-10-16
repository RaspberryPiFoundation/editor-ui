import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import PencilIcon from "../../assets/icons/pencil.svg";
import TickIcon from "../../assets/icons/tick.svg";

import { Button } from "@raspberrypifoundation/design-system-react";
import { useProjectNameEditing } from "../../hooks/useProjectNameEditing";

import "../../assets/stylesheets/ProjectName.scss?inline";
import classNames from "classnames";
import PropTypes from "prop-types";

const ProjectName = ({
  className = null,
  showLabel = false,
  editable = true,
  isHeading = false,
}) => {
  const { t } = useTranslation();
  const {
    actionRef,
    handleBlur,
    handleKeyDown,
    isEditing,
    name,
    projectName,
    saveName,
    setName,
    startEditing,
  } = useProjectNameEditing();
  const nameInput = useRef();

  const selectText = () => {
    nameInput.current.select();
  };

  const handleScroll = () => {
    if (!isEditing) {
      nameInput.current.scrollLeft = 0;
    }
  };

  useEffect(() => {
    if (isEditing) {
      nameInput.current.focus();
    }
  }, [isEditing]);

  return (
    <>
      {showLabel && (
        <label htmlFor="project_name" className="project-name__label">
          {t("projectName.label")}
        </label>
      )}
      <div className={classNames("project-name", className)}>
        <h1 className="rpf-visually-hidden">
          {projectName || t("header.newProject")}
        </h1>

        <div className="project-name__value">
          {isEditing || !isHeading ? (
            <input
              className="project-name__input"
              id={"project_name"}
              ref={nameInput}
              type="text"
              onFocus={selectText}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              value={name}
              disabled={!isEditing}
              onChange={(event) => setName(event.target.value)}
              onBlur={handleBlur}
            />
          ) : (
            <div className="project-name__title">{name}</div>
          )}
        </div>
        {editable && (
          <div className="project-name__action" ref={actionRef}>
            <Button
              aria-label={t(
                isEditing ? "header.renameSave" : "header.renameProject",
              )}
              title={t(
                isEditing ? "header.renameSave" : "header.renameProject",
              )}
              icon={isEditing ? <TickIcon /> : <PencilIcon />}
              iconOnly
              onClick={isEditing ? saveName : startEditing}
              type={isEditing ? "primary" : "tertiary"}
              size="small"
            />
          </div>
        )}
      </div>
    </>
  );
};

ProjectName.propTypes = {
  className: PropTypes.string,
  showLabel: PropTypes.bool,
};

export default ProjectName;
