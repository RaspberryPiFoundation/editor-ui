import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import PencilIcon from "../../assets/icons/pencil.svg";
import TickIcon from "../../assets/icons/tick.svg";

import Button from "../Button/Button";
import { updateProjectName } from "../../redux/EditorSlice";

import "../../assets/stylesheets/ProjectName.scss";
import classNames from "classnames";
import PropTypes from "prop-types";

const ProjectName = ({ className = null, showLabel = false }) => {
  const project = useSelector((state) => state.editor.project, shallowEqual);
  const webComponent = useSelector((state) => state.editor.webComponent);

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const nameInput = useRef();
  const tickButton = useRef();

  const [isEditable, setEditable] = useState(false);
  const [isReadOnly, setReadOnly] = useState(false);
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
    setReadOnly(!!webComponent);
  }, [webComponent]);

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
  }, [nameInput, tickButton, project, resetName]);

  return (
    <>
      {showLabel && (
        <label htmlFor="project_name" className="project-name__label">
          {t("projectName.label")}
        </label>
      )}
      <div className={classNames("project-name", className)}>
        {isReadOnly ? (
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
        {!isReadOnly &&
          (isEditable ? (
            <Button
              buttonRef={tickButton}
              className="btn--primary"
              label={t("header.renameSave")}
              title={t("header.renameSave")}
              ButtonIcon={TickIcon}
              onClickHandler={updateName}
            />
          ) : (
            <Button
              className="btn--tertiary project-name__button"
              label={t("header.renameProject")}
              title={t("header.renameProject")}
              ButtonIcon={PencilIcon}
              onClickHandler={onEditNameButtonClick}
            />
          ))}
      </div>
    </>
  );
};

ProjectName.propTypes = {
  className: PropTypes.string,
  showLabel: PropTypes.bool,
};

export default ProjectName;
