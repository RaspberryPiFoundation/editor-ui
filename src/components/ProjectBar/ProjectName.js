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
  const [isEditable, setEditable] = useState(false);

  useEffect(() => {
    if (isEditable) {
      nameInput.current.focus();
    }
  });

  const updateName = (event) => {
    event.stopPropagation();
    setEditable(false);
    dispatch(updateProjectName(nameInput.current.value));
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
      event.preventDefault();
      nameInput.current.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setEditable(false);
      nameInput.current.value = project.name;
    }
  };

  return (
    <div className="project-name">
      <input
        className="project-name__input"
        ref={nameInput}
        type="text"
        onBlur={updateName}
        onFocus={selectText}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        defaultValue={project.name || t("header.newProject")}
        disabled={!isEditable}
      />
      {isEditable ? (
        <Button
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
