import React from "react";
import PropTypes from "prop-types";

import "../../../assets/stylesheets/MobileProject.scss";

const MobileProject = ({ identifier }) => {
  return (
    <div className="proj-container proj-editor-container proj-container--mobile">
      <editor-wc
        class="c-editor__wc"
        data-editor-target="editor"
        identifier={identifier}
        with_sidebar="true"
        sidebar_options={JSON.stringify([
          "projects",
          "file",
          "images",
          "settings",
          "info",
        ])}
      ></editor-wc>
    </div>
  );
};

MobileProject.propTypes = {
  identifier: PropTypes.string,
};

export default MobileProject;
