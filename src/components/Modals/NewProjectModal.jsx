import React, { useState } from "react";

import Button from "../Button/Button";
import { closeNewProjectModal } from "../../redux/EditorSlice";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import InputModal from "./InputModal";
import { Api } from "../../utils/apiCallHandler";
import { useNavigate } from "react-router-dom";
import { DEFAULT_PROJECTS } from "../../utils/defaultProjects";
import HTMLIcon from "../../assets/icons/html.svg";
import PythonIcon from "../../assets/icons/python.svg";

const NewProjectModal = () => {
  const api = new Api();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const isModalOpen = useSelector(
    (state) => state.editor.newProjectModalShowing,
  );
  const closeModal = () => dispatch(closeNewProjectModal());

  const [projectName, setProjectName] = useState(
    t("newProjectModal.projectName.default"),
  );
  const [projectType, setProjectType] = useState();

  const navigate = useNavigate();

  const createProject = async () => {
    const response = await api.createOrUpdateProject(
      { ...DEFAULT_PROJECTS[projectType], name: projectName },
      user.access_token,
    );
    const identifier = response.data.identifier;
    const locale = i18n.language;
    closeModal();
    navigate(`/${locale}/projects/${identifier}`);
  };

  return (
    <InputModal
      isOpen={isModalOpen}
      closeModal={closeModal}
      withCloseButton
      heading={t("newProjectModal.heading")}
      inputs={[
        {
          type: "text",
          label: t("newProjectModal.projectName.inputLabel"),
          helpText: t("newProjectModal.projectName.helpText"),
          value: projectName,
          setValue: setProjectName,
        },
        {
          type: "radio",
          label: t("newProjectModal.projectType.inputLabel"),
          value: projectType,
          setValue: setProjectType,
          options: [
            {
              value: "python",
              label: t("projectTypes.python"),
              Icon: PythonIcon,
            },
            {
              value: "html",
              label: t("projectTypes.html"),
              Icon: HTMLIcon,
            },
          ],
        },
      ]}
      defaultCallback={createProject}
      buttons={[
        <Button
          key="create"
          className="btn--primary"
          buttonText={t("newProjectModal.createProject")}
          onClickHandler={createProject}
        />,
        <Button
          key="close"
          className="btn--secondary"
          buttonText={t("newProjectModal.cancel")}
          onClickHandler={closeModal}
        />,
      ]}
    />
  );
};

export default NewProjectModal;
