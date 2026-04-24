import React from "react";
import { useTranslation } from "react-i18next";

import "../../assets/stylesheets/LoadFailed.scss";

const LoadFailed = () => {
  const { t } = useTranslation();

  return (
    <div className="load-failed" data-testid="load-failed" role="alert">
      <span>{t("webComponent.failed")}</span>
    </div>
  );
};

export default LoadFailed;
