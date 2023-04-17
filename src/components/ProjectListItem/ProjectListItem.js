import { intlFormatDistance } from "date-fns";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  showDeleteProjectModal,
  showRenameProjectModal,
} from "../Editor/EditorSlice";
import Button from "../Button/Button";
import python_logo from "../../assets/python_icon.svg";
import "./ProjectListItem.scss";
import { BinIcon, PencilIcon } from "../../Icons";
import ProjectActionsMenu from "../Menus/ProjectActionsMenu/ProjectActionsMenu";
import { Link } from "react-router-dom";
import { gql } from "@apollo/client";

export const PROJECT_LIST_ITEM_FRAGMENT = gql`
  fragment ProjectListItemFragment on Project {
    name
    identifier
    locale
    updatedAt
  }
`;

export const ProjectListItem = (props) => {
  const project = props.project;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const dispatch = useDispatch();
  const lastSaved = intlFormatDistance(
    new Date(project.updatedAt),
    Date.now(),
    { style: "short" }
  );

  const openRenameProjectModal = () => {
    dispatch(showRenameProjectModal(project));
  };

  const openDeleteProjectModal = () => {
    dispatch(showDeleteProjectModal(project));
  };

  return (
    <div className="editor-project-list__item">
      <div className="editor-project-list__info">
        <Link
          className="editor-project-list__title"
          to={`/${locale}/projects/${project.identifier}`}
        >
          <img
            className="editor-project-list__type"
            src={python_logo}
            alt={t("header.editorLogoAltText")}
          />
          <div className="magda">
            <h2 className="editor-project-list__name">{project.name}</h2>
            <span className="editor-project-list__heading">Python</span>
            <span className="editor-project-list__heading">
              {t("projectList.updated")}
            </span>
            <span className="editor-project-list__updated">{lastSaved}</span>
          </div>
        </Link>
      </div>
      <div className="editor-project-list__actions">
        <Button
          className="btn--tertiary editor-project-list__rename"
          buttonText={t("projectList.rename")}
          ButtonIcon={PencilIcon}
          onClickHandler={openRenameProjectModal}
          label={t("projectList.renameLabel")}
          title={t("projectList.renameLabel")}
        />
        <Button
          className="btn--tertiary editor-project-list__delete"
          buttonText={t("projectList.delete")}
          ButtonIcon={BinIcon}
          onClickHandler={openDeleteProjectModal}
          label={t("projectList.deleteLabel")}
          title={t("projectList.deleteLabel")}
        />
      </div>
      <ProjectActionsMenu project={project} />
    </div>
  );
};
