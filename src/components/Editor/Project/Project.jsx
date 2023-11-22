/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import "react-tabs/style/react-tabs.css";
import "react-toastify/dist/ReactToastify.css";
import { useContainerQuery } from "react-container-query";
import classnames from "classnames";

import { projContainer } from "../../../utils/containerQueries";

import "../../../assets/stylesheets/Project.scss";
import "../../../assets/stylesheets/OutputViewToggle.scss";

const Project = ({ identifier }) => {
  const [params, containerRef] = useContainerQuery(projContainer);
  const authKey = `oidc.user:${process.env.REACT_APP_AUTHENTICATION_URL}:${process.env.REACT_APP_AUTHENTICATION_CLIENT_ID}`;

  return (
    <div className="proj">
      <div ref={containerRef} className={classnames("proj-container", {})}>
        <div className="project-wrapper">
          <div className="c-editor">
            <editor-wc
              class="c-editor__wc"
              auth_key={authKey}
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
        </div>
      </div>
    </div>
  );
};

export default Project;
