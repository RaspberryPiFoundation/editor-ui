import React from "react";
import { useTranslation } from "react-i18next";

import AccessDeniedWithAuthModal from "./AccessDeniedWithAuthModal";

const AccessDeniedWithAuthModalEmbedded = (props) => {
  const { t } = useTranslation();

  return (
    <AccessDeniedWithAuthModal
      withCloseButton={false}
      withClickToClose={false}
      buttons={[
        <a
          className="btn btn--secondary"
          href="https://projects.raspberrypi.org"
        >
          {t("project.accessDeniedWithAuthModal.projectsSiteLinkText")}
        </a>,
      ]}
      text={[
        {
          type: "paragraph",
          content: t("project.accessDeniedWithAuthModal.embedded.text"),
        },
      ]}
    />
  );
};

export default AccessDeniedWithAuthModalEmbedded;
