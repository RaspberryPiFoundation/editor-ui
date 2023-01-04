import './ProjectHeader.scss'

const ProjectHeader = (props) => {
  return (
    <header className='editor-project-header'>
      <div className='editor-project-header__content'>
        <h2>Code Editor</h2>
        <h1 className='editor-project-header__title'>Your Projects</h1>
        <p>Select a project to edit, view and open to continue coding.</p>
      </div>
      <div className='editor-project-header__action'>
        {props.children}
      </div>
    </header>
  );
};

export default ProjectHeader;
