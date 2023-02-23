import React from "react";
import { useTranslation } from "react-i18next";
import { gql } from '@apollo/client'

import { ChevronLeft, ChevronRight, DoubleChevronLeft, DoubleChevronRight } from "../../Icons";
import Button from "../Button/Button";
import './ProjectIndexPagination.scss'

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

  const pageInfo = paginationData.pageInfo;
  const totalCount = paginationData.totalCount || 0;
  if (totalCount === 0) return null;

  const lastPageSize = (totalCount % pageSize || pageSize);
  const totalPages = Math.ceil(totalCount / pageSize)
  // Yes, decoding this cursor is BAD.
  const currentPage = Math.ceil((pageInfo?.endCursor ? atob(pageInfo.endCursor) : pageSize) / pageSize);

  return (
    <div className='editor-project-list-pagination'>
      <div className='editor-project-pagination__buttons'>
        { pageInfo.hasPreviousPage ?
          <>
            <Button className='btn--tertiary' ButtonIcon={DoubleChevronLeft} onClickHandler={() => fetchMore({variables: {first: pageSize}})} title={t('projectList.pagination.first')}/>
            <Button className='btn--primary' ButtonIcon={ChevronLeft} onClickHandler={() => fetchMore({variables: {first: null, before: pageInfo.startCursor, last: pageSize}})} title={t('projectList.pagination.previous')}/>
          </>
          : null
        }
      </div>
      <span className='editor-project-list-pagination__current-page'>{currentPage} / {totalPages}</span>
      <div className='editor-project-pagination__buttons'>
        { pageInfo.hasNextPage ?
          <>
            <Button className='btn--primary' ButtonIcon={ChevronRight} onClickHandler={() => fetchMore({variables: {first: pageSize, after: pageInfo.endCursor}})} title={t('projectList.pagination.next')}/>
            <Button className='btn--tertiary' ButtonIcon={DoubleChevronRight} onClickHandler={() => fetchMore({variables: {first: null, last: lastPageSize}})} title={t('projectList.pagination.last')}/>
          </>
          : null
        }
      </div>
    </div>
  )
}

