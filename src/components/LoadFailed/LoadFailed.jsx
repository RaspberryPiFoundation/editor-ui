import React from "react";
import { useTranslation } from "react-i18next";

import "../../assets/stylesheets/LoadFailed.scss";

const LoadFailed = ({ onRetry }) => {
  const { t } = useTranslation();

  return (
    <div className="load-failed" data-testid="load-failed" role="alert">
      <span>{t("webComponent.failed")}</span>
      <button onClick={onRetry}>{t("webComponent.retry")}</button>
    </div>
  );
};

export default LoadFailed;
