import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';
import { default as ProjectListItem, PROJECT_LIST_ITEM_FRAGMENT } from '../ProjectListItem/ProjectListItem'
import './ProjectListTable.scss'
import { gql } from '@apollo/client';

export const PROJECT_LIST_TABLE_FRAGMENT = gql`
  fragment ProjectListTableFragment on ProjectConnection {
    edges {
      node {
        ...ProjectListItemFragment
      }
    }
  }
  ${PROJECT_LIST_ITEM_FRAGMENT}
`;

const ProjectListTable = (props) => {
  const { t } = useTranslation();
  const projects = props.projects.edges;

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
                <ProjectListItem project={project.node} key={i}/>
              )
            )}
          </>
          :
          <div className='editor-project-list__empty'>
            <p>{t('projectList.empty')}</p>
          </div>
        }
      </div>
    </div>
  )
};

export default ProjectListTable;
