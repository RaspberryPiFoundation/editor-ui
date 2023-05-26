import { useTranslation } from "react-i18next";
import {
  ProjectListItem,
  PROJECT_LIST_ITEM_FRAGMENT,
} from "../ProjectListItem/ProjectListItem";
import "./ProjectListTable.scss";
import { gql } from "@apollo/client";

export const PROJECT_LIST_TABLE_FRAGMENT = gql`
  fragment ProjectListTableFragment on ProjectConnection {
    edges {
      cursor
      node {
        id
        ...ProjectListItemFragment
      }
    }
  }
  ${PROJECT_LIST_ITEM_FRAGMENT}
`;

export const ProjectListTable = (props) => {
  const { t } = useTranslation();
  const { projectData } = props;

  const projectList = projectData?.edges?.map((edge) => edge.node);

  return (
    <div className="editor-project-list">
      <div className="editor-project-list__container">
        {projectList && projectList.length > 0 ? (
          <>
            {projectList.map((project, i) => (
              <ProjectListItem project={project} key={i} />
            ))}
          </>
        ) : (
          <div className="editor-project-list__empty">
            <p>{t("projectList.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
