import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ExternalFiles from "../../ExternalFiles/ExternalFiles";
import RunnerFactory from "../Runners/RunnerFactory";
import RunBar from "../../RunButton/RunBar";

const Output = ({ outputPanels = ["text", "visual"] }) => {
  const project = useSelector((state) => state.editor.project);
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const { t } = useTranslation();
  const searchParams = new URLSearchParams(window.location.search);
  const isBrowserPreview = searchParams.get("browserPreview") === "true";

  return (
    <>
      <ExternalFiles />
      <section
        className="proj-runner-container"
        data-testid="output"
        aria-label={t("regions.outputPanel")}
      >
        <RunnerFactory
          projectType={project.project_type}
          outputPanels={outputPanels}
        />
        {isEmbedded && !isBrowserPreview && <RunBar embedded />}
      </section>
    </>
  );
};

export default Output;
