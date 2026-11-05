import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { updateProjectName } from "../redux/EditorSlice";

export const useProjectNameEditing = () => {
  const projectName = useSelector((state) => state.editor.project.name);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const fallbackName = t("projectName.newProject");
  const actionRef = useRef();
  const [isEditing, setEditing] = useState(false);
  const [name, setName] = useState(projectName || fallbackName);

  useEffect(() => {
    setName(projectName || fallbackName);
  }, [fallbackName, projectName]);

  const startEditing = useCallback(() => {
    setEditing(true);
  }, []);

  const saveName = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setEditing(false);
      dispatch(updateProjectName(name));
    },
    [dispatch, name],
  );

  const cancelEditing = useCallback(
    (event) => {
      event?.preventDefault();
      setEditing(false);
      setName(projectName || fallbackName);
    },
    [fallbackName, projectName],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        saveName(event);
      } else if (event.key === "Escape") {
        cancelEditing(event);
      }
    },
    [cancelEditing, saveName],
  );

  const handleBlur = useCallback(
    (event) => {
      if (!actionRef.current?.contains(event.relatedTarget)) {
        cancelEditing();
      }
    },
    [cancelEditing],
  );

  return {
    actionRef,
    cancelEditing,
    handleBlur,
    handleKeyDown,
    isEditing,
    name,
    projectName,
    saveName,
    setName,
    startEditing,
  };
};
