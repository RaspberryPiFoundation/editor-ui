import { useTranslation } from 'react-i18next';
import { default as ProjectListItem, PROJECT_LIST_ITEM_FRAGMENT } from '../ProjectListItem/ProjectListItem'
import './ProjectListTable.scss'
import './ProjectIndexPagination.scss'
import { ChevronLeft, ChevronRight, DoubleChevronLeft, DoubleChevronRight } from "../../Icons";
import Button from "../Button/Button";
import { gql,useQuery } from '@apollo/client';

const PROJECT_LIST_TABLE_QUERY = gql`
  query ProjectListTable($userId: String,$before: String, $last: Int, $first: Int, $after: String) {
    projects(userId: $userId, first: $first, last: $last, before: $before, after: $after) {
      edges {
        cursor
        node {
          id
          ...ProjectListItemFragment
        }
      }
      totalCount
      pageInfo {
        hasPreviousPage
        startCursor
        endCursor
        hasNextPage
      }
    }
  }
  ${PROJECT_LIST_ITEM_FRAGMENT}
`;


const ProjectListTable = (props) => {
  const { t } = useTranslation();
  const { userId } = props;
  const pageSize = 8;

  const { loading, error, data, fetchMore } = useQuery(PROJECT_LIST_TABLE_QUERY, { variables: { userId: userId, first: pageSize } } );

  const projects = data?.projects?.edges?.map((edge) => edge.node);
  const pageInfo = data?.projects?.pageInfo;
  const totalCount = data?.projects?.totalCount || 0;
  const lastPageSize = (totalCount % pageSize || pageSize);
  const totalPages = Math.ceil(totalCount / pageSize)
  const currentPage = Math.floor(atob(pageInfo?.startCursor || "Mz") / pageSize) + 1;

  return (
    <div className='editor-project-list'>
      <div className='editor-project-list__container'>
        { !loading && projects.length > 0 ?
          <>
            <div className='editor-project-list__item'>
              <h4 className='editor-project-list__heading'>{t('projectList.name')}</h4>
              <h4 className='editor-project-list__heading'>{t('projectList.updated')}</h4>
            </div>
            { projects.map((project, i) => (
                <ProjectListItem project={project} key={i}/>
              )
            )}
          </>
          :
          <div className='editor-project-list__empty'>
            { loading ? <p>{t('projectList.loading')}</p> : <p>{t('projectList.empty')}</p> }
          </div>
        }
        { error ? <p>{t('projectList.loadingFailed')}</p> : null }
      </div>
      { totalCount > 0 ?
        <>
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
                  <Button className='btn--tertiary' ButtonIcon={DoubleChevronRight} onClickHandler={() => fetchMore({variables: {first: null, last: lastPageSize}})} title={t('projectList.pagination.first')}/>
                </>
                : null
              }
            </div>
          </div>
        </>
        : null }
    </div>
  )
};

export default ProjectListTable;
