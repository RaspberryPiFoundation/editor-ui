import { useTranslation } from 'react-i18next';
import { ProjectListItem, PROJECT_LIST_ITEM_FRAGMENT } from '../ProjectListItem/ProjectListItem'
import './ProjectListTable.scss'
import { gql } from '@apollo/client';

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

  const projectList = projectData.edges.map((edge) => edge.node);

  return (
    <div className='editor-project-list'>
      <div className='editor-project-list__container'>
        { projectList.length > 0 ?
          <>
            <div className='editor-project-list__item'>
              <h4 className='editor-project-list__heading'>{t('projectList.name')}</h4>
              <h4 className='editor-project-list__heading'>{t('projectList.updated')}</h4>
            </div>
            { projectList.map((project, i) => (
                <ProjectListItem project={project} key={i}/>
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

