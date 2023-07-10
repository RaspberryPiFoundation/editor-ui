import "./ProjectImages.scss";

import { useSelector } from "react-redux";

const ProjectImages = () => {
  const projectImages = useSelector((state) => state.editor.project.image_list);
  console.log(projectImages);

  return (
    <div className="project-images">
      {projectImages.map((image, i) => (
        <div key={i} className="project-images__block">
          <div className="project-images__image-wrapper">
            <img
              className="project-images__image"
              src={image.url}
              alt={image.filename}
            />
          </div>
          <p>{image.filename}</p>
        </div>
      ))}
    </div>
  );
};

export default ProjectImages;
