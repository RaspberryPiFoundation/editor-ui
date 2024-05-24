import React from "react";
import PropTypes from "prop-types";

import "../../../assets/stylesheets/MobileProject.scss";

const MobileProject = ({ identifier }) => {
  const authKey = `oidc.user:${process.env.REACT_APP_AUTHENTICATION_URL}:${process.env.REACT_APP_AUTHENTICATION_CLIENT_ID}`;

  return (
    <div className="proj-container proj-editor-container proj-container--mobile">
      <editor-wc
        class="c-editor__wc"
        auth_key={authKey}
        data-editor-target="editor"
        data-testid="editor-wc"
        identifier={identifier}
        load_remix_disabled="true"
        with_projectbar="true"
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
