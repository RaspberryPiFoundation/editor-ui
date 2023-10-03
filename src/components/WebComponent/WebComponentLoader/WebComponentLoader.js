import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setProject, setSenseHatAlwaysEnabled } from "../../Editor/EditorSlice";
import WebComponentProject from "../Project/WebComponentProject";
import { useProject } from "../../Editor/Hooks/useProject";
import { useProjectPersistence } from "../../Editor/Hooks/useProjectPersistence";

const ProjectComponentLoader = (props) => {
  const loading = useSelector((state) => state.editor.loading);
  const { identifier, code, user, access_token, sense_hat_always_enabled } =
    props;
  const dispatch = useDispatch();
  const [projectIdentifier, setProjectIdentifier] = useState(identifier);
  const project = useSelector((state) => state.editor.project);

  useEffect(() => {
    if (loading === "idle" && project.identifier) {
      setProjectIdentifier(project.identifier);
    }
  }, [loading, project]);

  useProject({
    projectIdentifier: projectIdentifier,
    accessToken: access_token,
  });
  useProjectPersistence({
    user: {
      access_token: access_token,
      profile: {
        user: user,
      },
    },
  });

  useEffect(() => {
    dispatch(
      setSenseHatAlwaysEnabled(typeof sense_hat_always_enabled !== "undefined"),
    );
    if (code) {
      const proj = {
        name: "Blank project",
        type: "python",
        components: [{ name: "main", extension: "py", content: code }],
      };
      dispatch(setProject(proj));
    }
  }, [code, sense_hat_always_enabled, dispatch]);

  return loading === "success" ? (
    <>
      <WebComponentProject />
    </>
  ) : (
    <>
      <p>Loading</p>
    </>
  );
};

export default ProjectComponentLoader;
