import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const DEFAULT_LOADER_DELAY = 250;

const Loader = ({ display = true, delay = DEFAULT_LOADER_DELAY }) => {
  const [waiting, setWaiting] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setWaiting(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <>
      {display && waiting ? (
        <div className="loader" data-testid="loader">
          <span>{t("loadingStates.loading")}</span>
        </div>
      ) : null}
    </>
  );
};

Loader.propTypes = {
  display: PropTypes.bool,
  delay: PropTypes.number,
};

export default Loader;
