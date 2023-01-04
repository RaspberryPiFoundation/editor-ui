const ProjectHeader = (props) => {
  return (
    <header>
      <h2>This is the project header</h2>
      {props.children}
    </header>
  );
};

export default ProjectHeader;
