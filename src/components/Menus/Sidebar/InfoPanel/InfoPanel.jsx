import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import SidebarPanel from "../SidebarPanel";
import GeneralModal from "../../../Modals/GeneralModal";
import DesignSystemButton from "../../../DesignSystemButton/DesignSystemButton";

import "../../../../assets/stylesheets/InfoPanel.scss";

const CODE_EDITOR_FEEDBACK_URL =
  "https://form.raspberrypi.org/f/code-editor-feedback";

const feedbackUrl = (url) => {
  if (typeof url !== "string" || url.trim() === "") {
    return CODE_EDITOR_FEEDBACK_URL;
  }

  try {
    const parsedUrl = new URL(url.trim());
    return parsedUrl.protocol === "https:"
      ? parsedUrl.href
      : CODE_EDITOR_FEEDBACK_URL;
  } catch {
    return CODE_EDITOR_FEEDBACK_URL;
  }
};

const InfoPanel = ({ feedbackFormUrl = CODE_EDITOR_FEEDBACK_URL }) => {
  const { t } = useTranslation();
  const [isLicencesModalOpen, setIsLicencesModalOpen] = useState(false);
  const projectType = useSelector((state) => state.editor.project.project_type);
  const isScratchProject = projectType === "code_editor_scratch";

  const links = [
    {
      id: "help",
      text: t("sidebar.help"),
      href: "https://help.editor.raspberrypi.org/hc/en-us",
    },
    {
      id: "feedback",
      text: t("sidebar.feedback"),
      href: feedbackUrl(feedbackFormUrl),
    },
    {
      id: "privacy",
      text: t("sidebar.privacy"),
      href: "https://www.raspberrypi.org/privacy/child-friendly/",
    },
    {
      id: "cookies",
      text: t("sidebar.cookies"),
      href: "https://www.raspberrypi.org/cookies/",
    },
    {
      id: "accessibility",
      text: t("sidebar.accessibility"),
      href: "https://www.raspberrypi.org/accessibility/",
    },
    {
      id: "safeguarding",
      text: t("sidebar.safeguarding"),
      href: "https://www.raspberrypi.org/safeguarding/",
    },
  ];

  return (
    <SidebarPanel heading={t("infoPanel.info")}>
      <div className="info-panel">
        <p>{t("sidebar.information_text")}</p>
      </div>
      <div className="info-panel info-panel__links">
        {links.map((link, i) => (
          <a
            key={i}
            className="info-panel__link"
            href={link.href}
            target="_blank"
            rel="noreferrer"
          >
            {link.text}
          </a>
        ))}
        {isScratchProject && (
          <button
            type="button"
            className="info-panel__link"
            onClick={() => setIsLicencesModalOpen(true)}
          >
            {t("sidebar.licences")}
          </button>
        )}
        <p>{t("sidebar.charity")}</p>
      </div>

      {isScratchProject && (
        <GeneralModal
          isOpen={isLicencesModalOpen}
          heading={t("sidebar.licences")}
          closeModal={() => setIsLicencesModalOpen(false)}
          buttons={[
            <DesignSystemButton
              key="close"
              type="secondary"
              text={t("modals.close")}
              onClick={() => setIsLicencesModalOpen(false)}
            />,
          ]}
        >
          <section className="info-panel__licences-modal__section">
            <h2>Scratch Editor</h2>
            <p>Copyright (C) Scratch Foundation</p>
            <p>Modified 2026 by the Raspberry Pi Foundation</p>
            <p>
              This program is free software: you can redistribute it and/or
              modify it under the terms of the GNU Affero General Public License
              as published by the Free Software Foundation, either version 3 of
              the License, or (at your option) any later version.
            </p>
            <p>
              This program is distributed in the hope that it will be useful,
              but WITHOUT ANY WARRANTY; without even the implied warranty of
              MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
              Affero General Public License for more details.
            </p>
            <p>
              You should have received a copy of the GNU Affero General Public
              License along with this program. If not, see{" "}
              <a
                href="https://www.gnu.org/licenses/"
                target="_blank"
                rel="noreferrer"
              >
                https://www.gnu.org/licenses/
              </a>
              .
            </p>
            <p>
              See original source code and full licence at{" "}
              <a
                href="https://github.com/scratchfoundation/scratch-editor"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/scratchfoundation/scratch-editor
              </a>
              .
            </p>
            <p>
              See modified source code and full licence at{" "}
              <a
                href="https://github.com/RaspberryPiFoundation/scratch-editor/tree/code-classroom"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/RaspberryPiFoundation/scratch-editor/tree/code-classroom
              </a>
              .
            </p>
          </section>
          <section className="licences-modal__section">
            <h2>Scratch Frame</h2>
            <p>Copyright (C) 2026 Raspberry Pi Foundation</p>
            <p>
              This program is free software: you can redistribute it and/or
              modify it under the terms of the GNU Affero General Public License
              as published by the Free Software Foundation, either version 3 of
              the License, or (at your option) any later version.
            </p>
            <p>
              This program is distributed in the hope that it will be useful,
              but WITHOUT ANY WARRANTY; without even the implied warranty of
              MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
              Affero General Public License for more details.
            </p>
            <p>
              You should have received a copy of the GNU Affero General Public
              License along with this program. If not, see{" "}
              <a
                href="https://www.gnu.org/licenses/"
                target="_blank"
                rel="noreferrer"
              >
                https://www.gnu.org/licenses/
              </a>
              .
            </p>
            <p>
              See source code and full licence at{" "}
              <a
                href="https://github.com/RaspberryPiFoundation/editor-ui/tree/main/apps/scratch-frame"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/RaspberryPiFoundation/editor-ui/tree/main/apps/scratch-frame
              </a>
              .
            </p>
          </section>
        </GeneralModal>
      )}
    </SidebarPanel>
  );
};

export default InfoPanel;
