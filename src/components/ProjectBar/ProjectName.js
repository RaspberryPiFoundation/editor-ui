import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { PencilIcon, TickIcon } from "../../Icons";
import Button from "../Button/Button";
import { updateProjectName } from "../Editor/EditorSlice";

import "./ProjectName.scss";

const ProjectName = () => {
  const project = useSelector((state) => state.editor.project);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const nameInput = useRef();
  const tickButton = useRef();
  const [isEditable, setEditable] = useState(false);

  useEffect(() => {
    if (isEditable) {
      nameInput.current.focus();
    }
  });

  const resetName = (event) => {
    event.preventDefault();
    setEditable(false);
    nameInput.current.value = project.name;
  };

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

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      updateName(event);
    } else if (event.key === "Escape") {
      resetName(event);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        nameInput.current &&
        !nameInput.current.contains(event.target) &&
        tickButton.current &&
        !tickButton.current.contains(event.target)
      ) {
        resetName(event);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [nameInput, tickButton, project, resetName]);

  const updateName = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setEditable(false);
    dispatch(updateProjectName(nameInput.current.value));
  };

  return (
    <div className="project-name">
      <input
        className="project-name__input"
        ref={nameInput}
        type="text"
        onFocus={selectText}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        defaultValue={project.name || t("header.newProject")}
        disabled={!isEditable}
      />
      {isEditable ? (
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
      )}
    </div>
  );
};

export default ProjectName;
