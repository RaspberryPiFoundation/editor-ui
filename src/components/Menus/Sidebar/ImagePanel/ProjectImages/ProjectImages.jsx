import React from "react";
import { useSelector } from "react-redux";

import "../../../../../assets/stylesheets/ProjectImages.scss";

const ProjectImages = () => {
  const projectImages = useSelector((state) => state.editor.project.image_list);

  return (
    <div className="project-images">
      {projectImages.map((image, i) => (
        <div key={i} className="project-images__block">
          <div className="project-images__image-wrapper">
            <img
              crossOrigin="true"
              className="project-images__image"
              src={
                image.content
                  ? `data:image/png;base64,${btoa(
                      new Uint8Array(Object.values(image.content)).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        "",
                      ),
                    )}`
                  : image.url
              }
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
