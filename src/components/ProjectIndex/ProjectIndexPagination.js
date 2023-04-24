import React from "react";
import { useTranslation } from "react-i18next";
import { gql } from "@apollo/client";

import { PlusIcon } from "../../Icons";
import Button from "../Button/Button";
import "./ProjectIndexPagination.scss";

export const PROJECT_INDEX_PAGINATION_FRAGMENT = gql`
  fragment ProjectIndexPaginationFragment on ProjectConnection {
    totalCount
    pageInfo {
      hasPreviousPage
      startCursor
      endCursor
      hasNextPage
    }
  }
`;

export const ProjectIndexPagination = (props) => {
  const { t } = useTranslation();
  const { paginationData, pageSize, fetchMore } = props;

  const totalCount = paginationData.totalCount || 0;
  if (totalCount === 0) return null;

  const pageInfo = paginationData.pageInfo || {};
  if (Object.keys(pageInfo).length === 0) return null;

  return (
    <div
      data-testid="projectIndexPagination"
      className="editor-project-list-pagination"
    >
      <div className="editor-project-pagination__buttons">
        {pageInfo.hasNextPage ? (
          <>
            <Button
              className="btn--primary"
              onClickHandler={() => {
                fetchMore({
                  variables: { first: pageSize, after: pageInfo.endCursor },
                });
              }}
              title={t("projectList.pagination.more")}
              buttonText={t("projectList.pagination.more")}
              ButtonIcon={PlusIcon}
              buttonIconLeft={false}
            />
          </>
        ) : null}
      </div>
    </div>
  );
};
