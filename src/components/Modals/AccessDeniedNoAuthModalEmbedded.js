import React from "react";
import { useTranslation } from "react-i18next";

import AccessDeniedNoAuthModal from "./AccessDeniedNoAuthModal";

const AccessDeniedNoAuthModalEmbedded = (props) => {
  const { t } = useTranslation();

  return (
    <AccessDeniedNoAuthModal
      withCloseButton={false}
      withClickToClose={false}
      buttons={[
        <a
          className="btn btn--secondary"
          href="https://projects.raspberrypi.org"
        >
          {t("project.accessDeniedNoAuthModal.projectsSiteLinkText")}
        </a>,
      ]}
      text={[
        {
          type: "paragraph",
          content: t("project.accessDeniedNoAuthModal.embedded.text"),
        },
      ]}
    />
  );
};

export default AccessDeniedNoAuthModalEmbedded;
