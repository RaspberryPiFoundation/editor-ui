import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';
import ProjectListItem from '../ProjectListItem/ProjectListItem'
import './ProjectListTable.scss'

const ProjectListTable = () => {
  const { t } = useTranslation();
  let projectList = useSelector((state) => state.editor.projectList);
  const user = useSelector((state) => state.auth.user);
  const projectSortList = [...projectList];

  projectList = projectSortList.sort((x, y) => {
    return new Date(y.updated_at) - new Date(x.updated_at);
  })

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
                <ProjectListItem project={project} user={user} key={i}/>
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
