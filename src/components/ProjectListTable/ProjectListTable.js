import ProjectListItem from '../ProjectListItem/ProjectListItem'
import './ProjectListTable.scss'

const ProjectListTable = (props) => {
  return (
    <div className='editor-project-list'>
      <div className='editor-project-list__container'>
        <div className='editor-project-list__item'>
          <h4 className='editor-project-list__heading'>Project Name</h4>
          <h4 className='editor-project-list__heading'>Last Updated</h4>
        </div>
        { props.projects.map((project, i) => (
            <ProjectListItem project={project} user={props.user} key={i}/>
          )
        )}
      </div>
    </div>
  )
};

export default ProjectListTable;
