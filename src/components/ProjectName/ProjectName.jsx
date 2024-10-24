import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import PencilIcon from "../../assets/icons/pencil.svg";
import TickIcon from "../../assets/icons/tick.svg";

import DesignSystemButton from "../DesignSystemButton/DesignSystemButton";
import { updateProjectName } from "../../redux/EditorSlice";

import "../../assets/stylesheets/ProjectName.scss";
import classNames from "classnames";
import PropTypes from "prop-types";

const ProjectName = ({
  className = null,
  showLabel = false,
  editable = true,
  isHeading = false,
}) => {
  const project = useSelector((state) => state.editor.project, shallowEqual);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const nameInput = useRef();
  const tickButton = useRef();

  const [isEditing, setEditing] = useState(false);
  const [name, setName] = useState(project.name || t("projectName.newProject"));

  const onEditNameButtonClick = () => {
    setEditing(true);
  };

  const selectText = () => {
    nameInput.current.select();
  };

  const handleScroll = () => {
    if (!isEditing) {
      nameInput.current.scrollLeft = 0;
    }
  };

  useEffect(() => {
    setName(project.name);
  }, [project.name]);

  const handleOnChange = () => {
    setName(nameInput.current.value);
  };

  const updateName = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setEditing(false);
    dispatch(updateProjectName(nameInput.current.value));
  };

  const resetName = useCallback(
    (event) => {
      event.preventDefault();
      setEditing(false);
      setName(project.name);
    },
    [project.name],
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      updateName(event);
    } else if (event.key === "Escape") {
      resetName(event);
    }
  };

  useEffect(() => {
    if (isEditing) {
      nameInput.current.focus();
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isEditing &&
        nameInput.current &&
        !nameInput.current.contains(event.target) &&
        tickButton.current &&
        !tickButton.current.contains(event.target)
      ) {
        resetName(event);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, nameInput, tickButton, project, resetName]);

  return (
    <>
      {showLabel && (
        <label htmlFor="project_name" className="project-name__label">
          {t("projectName.label")}
        </label>
      )}
      <div className={classNames("project-name", className)}>
        {/* TODO: Look into alternative approach so we don't need hidden h1 */}
        <h1 style={{ height: 0, width: 0, overflow: "hidden" }}>
          {project.name || t("header.newProject")}
        </h1>
        {editable || !isHeading ? (
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
            onChange={handleOnChange}
          />
        ) : (
          <div className="project-name__title">{name}</div>
        )}
        {editable && (
          <div ref={tickButton}>
            <DesignSystemButton
              className="project-name__button"
              aria-label={t(
                isEditing ? "header.renameSave" : "header.renameProject",
              )}
              title={t(
                isEditing ? "header.renameSave" : "header.renameProject",
              )}
              icon={isEditing ? <TickIcon /> : <PencilIcon />}
              onClick={isEditing ? updateName : onEditNameButtonClick}
              type={isEditing ? "primary" : "tertiary"}
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
