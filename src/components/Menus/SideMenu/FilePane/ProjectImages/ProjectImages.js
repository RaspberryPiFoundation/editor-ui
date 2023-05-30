import "./ProjectImages.scss";

import { useSelector } from "react-redux";
import { ChevronDown } from "../../../../../Icons";
import { useTranslation } from "react-i18next";

const ProjectImages = () => {
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const { t } = useTranslation();

  return (
    <details className="file-pane-section file-pane-section__images" open>
      <summary>
        <h2 className="menu-pop-out-subheading">{t("filePane.images")}</h2>
        <div className="accordion-icon">
          <ChevronDown />
        </div>
      </summary>
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
    </details>
  );
};

export default ProjectImages;
