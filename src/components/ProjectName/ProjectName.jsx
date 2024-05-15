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
  projectNameEditable = true,
}) => {
  const project = useSelector((state) => state.editor.project, shallowEqual);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const nameInput = useRef();
  const tickButton = useRef();

  const [isEditable, setEditable] = useState(false);
  const [name, setName] = useState(project.name || t("projectName.newProject"));

  const onEditNameButtonClick = () => {
    setEditable(true);
  };

  const selectText = () => {
    nameInput.current.select();
  };

  const handleScroll = () => {
    if (!isEditable) {
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
    setEditable(false);
    dispatch(updateProjectName(nameInput.current.value));
  };

  const resetName = useCallback(
    (event) => {
      event.preventDefault();
      setEditable(false);
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
    if (isEditable) {
      nameInput.current.focus();
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isEditable &&
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
  }, [isEditable, nameInput, tickButton, project, resetName]);

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
        {!projectNameEditable ? (
          <div className="project-name__title">{name}</div>
        ) : (
          <input
            className="project-name__input"
            id={"project_name"}
            ref={nameInput}
            type="text"
            onFocus={selectText}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            value={name}
            disabled={!isEditable}
            onChange={handleOnChange}
          />
        )}
        {projectNameEditable && (
          <div ref={tickButton}>
            <DesignSystemButton
              className="project-name__button"
              aria-label={t(
                isEditable ? "header.renameSave" : "header.renameProject",
              )}
              title={t(
                isEditable ? "header.renameSave" : "header.renameProject",
              )}
              icon={isEditable ? <TickIcon /> : <PencilIcon />}
              onClick={isEditable ? updateName : onEditNameButtonClick}
              type={isEditable ? "primary" : "tertiary"}
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
