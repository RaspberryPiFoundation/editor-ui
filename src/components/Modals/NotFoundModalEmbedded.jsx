import React from "react";
import { useTranslation } from "react-i18next";

import NotFoundModal from "./NotFoundModal";

const NotFoundModalEmbedded = (props) => {
  const { t } = useTranslation();

  return (
    <NotFoundModal
      withCloseButton={false}
      withClickToClose={false}
      buttons={[
        <a
          className="btn btn--secondary"
          href="https://projects.raspberrypi.org"
          key="not-found"
        >
          {t("project.notFoundModal.projectsSiteLinkText")}
        </a>,
      ]}
      text={[
        {
          type: "paragraph",
          content: t("project.notFoundModal.embedded.text"),
        },
      ]}
    />
  );
};

export default NotFoundModalEmbedded;
