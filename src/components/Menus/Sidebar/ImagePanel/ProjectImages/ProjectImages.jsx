import React from "react";
import { useSelector } from "react-redux";

import "../../../../../assets/stylesheets/ProjectImages.scss";

const ProjectImages = () => {
  const projectImages = useSelector((state) => state.editor.project.images);

  return (
    <div className="project-images">
      {projectImages.map((image, i) => (
        <div key={i} className="project-images__block">
          <div className="project-images__image-wrapper">
            <img
              crossOrigin="true"
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
