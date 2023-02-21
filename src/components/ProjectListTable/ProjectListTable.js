import { useTranslation } from 'react-i18next';
import { default as ProjectListItem, PROJECT_LIST_ITEM_FRAGMENT } from '../ProjectListItem/ProjectListItem'
import './ProjectListTable.scss'
import './ProjectIndexPagination.scss'
import { ChevronLeft, ChevronRight, DoubleChevronLeft, DoubleChevronRight } from "../../Icons";
import Button from "../Button/Button";
import { gql,useQuery } from '@apollo/client';

const PROJECT_LIST_TABLE_QUERY = gql`
  query ProjectListTable($userId: String!, $first: Int, $after: String) {
    projects(userId: $userId, first: $first, after: $after) {
      edges {
        node {
          ...ProjectListItemFragment
        }
      }
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

  const { loading, error, data, fetchMore } = useQuery(PROJECT_LIST_TABLE_QUERY, { variables: { userId: userId } } );

  if (loading) return <p>{t('projectList.loading')}</p>;

  const projects = data.projects.edges.map((edge) => edge.node);
  const pageInfo = data.projects.pageInfo;

  return (
    <div className='editor-project-list'>
      <div className='editor-project-list__container'>
        { projects.length > 0 ?
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
            <p>{t('projectList.empty')}</p>
          </div>
        }
        { error ? <p>{t('projectList.loadingFailed')}</p> : null }
      </div>
      <div className='editor-project-list-pagination'>
        <div className='editor-project-pagination__buttons'>
          { pageInfo.hasPreviousPage ?
            <>
              <Button className='btn--primary' ButtonIcon={ChevronLeft} onClickHandler={() => fetchMore({variables: {before: pageInfo.startCursor}})} title={t('projectList.pagination.previous')}/>
            </>
            : null
          }
        </div>
        <div className='editor-project-pagination__buttons'>
          { pageInfo.hasNextPage ?
            <>
              <Button className='btn--primary' ButtonIcon={ChevronRight} onClickHandler={() => fetchMore({variables: {after: pageInfo.endCursor}})} title={t('projectList.pagination.next')}/>
            </>
            : null
          }
        </div>
      </div>
    </div>
  )
};

export default ProjectListTable;
